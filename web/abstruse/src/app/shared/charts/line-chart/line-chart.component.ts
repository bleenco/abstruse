import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { bisector } from 'd3-array';
import { axisBottom, axisLeft, AxisScale } from 'd3-axis';
import { easeLinear } from 'd3-ease';
import { interpolatePath } from 'd3-interpolate-path';
import { ContainerElement, mouse, select, Selection } from 'd3-selection';
import { Area, Line } from 'd3-shape';
import { transition } from 'd3-transition';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ResizeService } from '../../providers/resize.service';
import {
  getArea,
  getFormattedValue,
  getLine, getScale,
  hexToRgb,
  LineChartData,
  LineChartEvent,
  LineChartEventClick,
  LineChartEventMouseEnter,
  LineChartEventMouseLeave,
  LineChartEventMouseMove,
  LineChartProperties,
  ScaleType
} from './line-chart.class';

interface LineType {
  g: Selection<SVGGElement, unknown, null, undefined>;
  line: Line<[number, number]>;
  linePath: Selection<SVGGElement, unknown, null, undefined>;
  area: Area<[number, number]>;
  areaPath: Selection<SVGGElement, unknown, null, undefined>;
  markers: Selection<SVGGElement, unknown, null, undefined>;
}

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements OnInit, OnDestroy, DoCheck {
  @Input() props: LineChartProperties;
  @Input() data: LineChartData[];
  @Output() events: EventEmitter<LineChartEvent>;

  el: HTMLElement;
  inited: boolean;
  differ: KeyValueDiffer<any, any>;
  dataDiffers: { id: string, differ: KeyValueDiffer<any, any> }[];
  width: number;
  height: number;
  x: ScaleType;
  y: ScaleType;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  clipPath: Selection<SVGRectElement, unknown, null, undefined>;
  g: Selection<SVGGElement, unknown, null, undefined>;
  xAxis: Selection<SVGGElement, unknown, null, undefined>;
  yAxis: Selection<SVGGElement, unknown, null, undefined>;
  crosshairG: Selection<SVGGElement, unknown, null, undefined>;
  mouseG: Selection<SVGGElement, unknown, null, undefined>;
  rect: Selection<SVGGElement, unknown, null, undefined>;
  lines: LineType[] = [];
  subs: Subscription;
  resizeSub: Subscription;
  differEvents: EventEmitter<void>;
  legend: { items: { color: string, id: string }[] } = { items: [] };
  tooltip: {
    title: string,
    items: { color: string, id: string, value: string }[],
    visible: boolean
  } = { title: '', items: [], visible: false };

  constructor(
    public elementRef: ElementRef,
    public differs: KeyValueDiffers,
    public ngZone: NgZone,
    public resizeService: ResizeService
  ) {
    this.subs = new Subscription();
    this.differEvents = new EventEmitter<void>();
    this.events = new EventEmitter<LineChartEvent>();
    this.subs.add(this.differEvents.pipe(debounceTime(100)).subscribe(() => this.drawChart()));
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.line-chart-container');
    this.differ = this.differs.find(this.props).create();
    this.dataDiffers = this.data.map((data) => {
      return { id: data.id, differ: this.differs.find(data).create() };
    });

    let [x, y] = [[], []];
    this.subs.add(
      this.events
        .pipe(
          filter(e => e.constructor.name === 'LineChartEventMouseMove'),
          distinctUntilChanged((p: LineChartEventMouseMove, c: LineChartEventMouseMove) => {
            const [{ type: pmt, mouseX: pmx, mouseY: pmy, ...prev }, { type: cmt, mouseX: cmx, mouseY: cmy, ...curr }] = [p, c];
            return JSON.stringify(prev) === JSON.stringify(curr);
          })
        )
        .subscribe((e: LineChartEventMouseMove) => {
          const [enterx, entery] = [e.x.filter(d => !x.includes(d)), e.y.filter(d => !y.includes(d))];
          const [outx, outy] = [x.filter(d => !e.x.includes(d)), y.filter(d => !e.y.includes(d))];
          [x, y] = [e.x, e.y];

          if (enterx && enterx.length && entery && entery.length) {
            const evMouseEnter = new LineChartEventMouseEnter('mouseenter', enterx, entery, e.mouseX, e.mouseY);
            this.events.emit(evMouseEnter);
          }
          if (outx && outx.length && outy && outy.length) {
            const evMouseLeave = new LineChartEventMouseLeave('mouseleave', x, y, e.mouseX, e.mouseY);
            this.events.emit(evMouseLeave);
          }
        })
    );
  }

  ngDoCheck() {
    if (this.differ.diff(this.props)) {
      this.differEvents.emit();
      return;
    }

    if (this.dataDiffers.some(x => x.differ.diff(this.data.find(d => d.id === x.id)))) {
      this.differEvents.emit();
      return;
    }

    const [diffid, dataid] = [this.dataDiffers.map(x => x.id), this.data.map(x => x.id)];
    if (!diffid.every(x => dataid.includes(x)) || !dataid.every(x => diffid.includes(x))) {
      this.dataDiffers = this.data.map(x => ({ id: x.id, differ: this.differs.find(x).create() }));
    }
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
  }

  private drawChart(preventAnimation: boolean = false): void {
    if (!this.checkLineValues() && (!this.lines || !this.lines.length)) {
      return;
    }

    if (!this.svg || preventAnimation || this.data.length !== this.lines.length) {
      this.initSelectors();
      this.drawLegend();
      this.calculateSize();
      this.setAxis();
      this.styleAxis();
      this.mouseEvents();
      this.applyStyles();

      if (!this.resizeSub) {
        this.resizeSub = this.resizeService.onResize$
          .pipe(debounceTime(500))
          .subscribe(() => this.drawChart(true));
      }

      if (!this.inited) {
        this.inited = true;
      }
    } else {
      this.drawLegend();
      this.calculateSize();
      this.setAxis();
      this.styleAxis();
      this.mouseEvents();
      this.applyStyles(true, preventAnimation);
    }
  }

  private initSelectors(): void {
    if (this.svg) { this.svg.remove(); }
    this.svg = select(this.el).select('.line-chart').append('svg');
    this.clipPath = this.svg.append('defs').append('clipPath').attr('id', 'clip').append('rect');
    this.g = this.svg.append('g');
    this.xAxis = this.g.append('g').attr('class', 'x axis');
    this.yAxis = this.g.append('g').attr('class', 'y axis');
    this.crosshairG = this.g.append('g').style('display', 'none');
    this.lines = this.data.map((d: LineChartData) => {
      const g = this.g.append('g');
      const line = getLine(this.x, this.y, d.curve);
      const linePath = g.append('path').attr('class', 'line');
      const area = getArea(this.x, this.y, d.curve, this.height);
      const areaPath = g.append('path').attr('class', 'area');
      const markers = g.append('g');

      return { g, line, linePath, area, areaPath, markers };
    });
    this.mouseG = this.g.append('g').style('display', 'none');
    this.crosshairG.append('line').attr('class', 'focus-line-x').style('fill', 'none');
    this.rect = this.svg.append('rect')
      .attr('class', 'mouse-rect')
      .style('fill', 'none')
      .style('stroke', 'none')
      .style('pointer-events', 'all');
  }

  private applyStyles(update: boolean = false, preventAnimation: boolean = false): void {
    this.removeMarkers();

    this.data.forEach((props: LineChartData, i: number) => {
      const line = this.lines[i];
      const t = transition().duration(this.props.transitions ? this.props.transitionDuration : 0).ease(easeLinear);
      line.line = getLine(this.x, this.y, props.curve);

      if ((update && !preventAnimation) || (this.props.initialTransition && !this.inited)) {
        if (this.props.initialTransition && !this.inited) {
          const [min] = this.y.domain();
          line.linePath.attr('d', line.line(props.data.map(d => ({ ...d, y: min })) as any));
        }

        line.linePath
          .transition(t)
          .attrTween('d', (_, x, el) => {
            const prev = select(el[x]).attr('d');
            const next = line.line(props.data as any);
            return interpolatePath(prev, next);
          })
          .on('end', () => {
            if (line.markers) {
              this.drawMarkers(line, props);
            }
          });
      } else {
        line.linePath.attr('d', line.line(props.data as any));
        if (line.markers) {
          this.drawMarkers(line, props);
        }
      }

      line.linePath
        .attr('stroke', props.color)
        .attr('stroke-opacity', props.opacity)
        .attr('stroke-width', props.lineSize)
        .style('shape-rendering', 'geometricPrecision')
        .style('fill', 'none');

      if (props.area) {
        line.area = getArea(this.x, this.y, props.curve, this.height);
        if ((update && !preventAnimation) || (this.props.initialTransition && !this.inited)) {
          if (this.props.initialTransition && !this.inited) {
            const [min] = this.y.domain();
            line.areaPath.attr('d', line.area(props.data.map(d => ({ ...d, y: min })) as any));
          }

          line.areaPath
            .transition(t)
            .attrTween('d', (_, x, el) => {
              const prev = select(el[x]).attr('d');
              const next = line.area(props.data as any);
              return interpolatePath(prev, next);
            });
        } else {
          line.areaPath.attr('d', line.area(props.data as any));
        }

        line.areaPath
          .attr('fill', props.areaColor)
          .attr('opacity', props.areaOpacity);
      }
    });
  }

  private setAxis(): void {
    this.x = getScale(this.props, this.data, 'x', this.width, this.height);
    this.y = getScale(this.props, this.data, 'y', this.width, this.height);

    if (!this.props.xGrid.tickFormat || !this.props.yGrid.tickFormat) {
      return;
    }

    this.xAxis
      .call(axisBottom(this.x as AxisScale<number | Date | { valueOf(): number; }>)
        .tickSizeInner(this.props.xGrid.enable ? -this.height : 0)
        .tickPadding(this.props.xGrid.tickPadding)
        .tickValues(this.props.xGrid.text ? this.props.xGrid.tickValues ? this.props.xGrid.tickValues : null as any : [])
        .ticks(null, typeof this.props.xGrid.tickFormat !== 'function' ? this.props.xGrid.tickFormat : null)
        .tickFormat(typeof this.props.xGrid.tickFormat === 'function' ? this.props.xGrid.tickFormat : null)
      ).attr('transform', `translate(0, ${this.height})`);

    this.yAxis
      .call(axisLeft(this.y as AxisScale<number | Date | { valueOf(): number; }>)
        .tickSize(this.props.yGrid.enable ? -this.width : 0)
        .tickPadding(this.props.yGrid.tickPadding)
        .tickValues(this.props.yGrid.text ? this.props.yGrid.tickValues ? this.props.yGrid.tickValues : null as any : [])
        .ticks(null, typeof this.props.yGrid.tickFormat !== 'function' ? this.props.yGrid.tickFormat : null)
        .tickFormat(typeof this.props.yGrid.tickFormat === 'function' ? this.props.yGrid.tickFormat : null)
      );
  }

  private styleAxis(): void {
    this.xAxis.selectAll('g.tick')
      .select('line')
      .style('shape-rendering', 'crispEdges')
      .style('fill', 'none')
      .style('stroke', this.props.xGrid.color)
      .style('stroke-width', this.props.xGrid.size)
      .style('stroke-dasharray', this.props.xGrid.dashed ? '3 3' : '0')
      .style('opacity', this.props.xGrid.opacity);

    this.xAxis.selectAll('g.tick')
      .selectAll('text')
      .attr('text-anchor', this.props.xGrid.tickTextAnchor)
      .style('fill', this.props.xGrid.textColor)
      .style('font-size', this.props.xGrid.textSize)
      .style('font-family', this.props.xGrid.fontFamily);

    this.yAxis.selectAll('g.tick')
      .select('line')
      .style('shape-rendering', 'crispEdges')
      .style('fill', 'none')
      .style('stroke', this.props.yGrid.color)
      .style('stroke-width', this.props.yGrid.size)
      .style('stroke-dasharray', this.props.yGrid.dashed ? '3 3' : '0')
      .style('opacity', this.props.yGrid.opacity);

    this.yAxis.selectAll('g.tick')
      .selectAll('text')
      .attr('text-anchor', this.props.yGrid.tickTextAnchor)
      .style('fill', this.props.yGrid.textColor)
      .style('font-size', this.props.yGrid.textSize)
      .style('font-family', this.props.yGrid.fontFamily);

    this.svg.selectAll('.axis')
      .select('path')
      .style('display', 'none');
  }

  private calculateSize(): void {
    const w = this.props.width || this.el.clientWidth;
    const h = this.props.height || this.el.clientHeight;

    this.width = w - this.props.margin.left - this.props.margin.right;
    this.height = h - this.props.margin.top - this.props.margin.bottom;

    this.svg.attr('width', w).attr('height', h);
    this.g.attr('transform', `translate(${this.props.margin.left}, ${this.props.margin.top})`);
    this.clipPath.attr('width', this.width).attr('height', this.height);
  }

  private drawLegend(): void {
    const legendEl = select(this.elementRef.nativeElement).select('.legend-container');
    if (!this.props.legend) {
      legendEl.style('display', 'none');
      return;
    }

    legendEl.style('display', 'flex');
    this.legend.items = this.data.map(d => ({ id: d.id, color: d.color }));

    switch (this.props.legendPosition) {
      case 'left':
        legendEl
          .style('left', `${this.props.legendMargin.left}px`)
          .style('top', `calc(50%)`)
          .style('transform', `translateY(-50%)`);
        break;
      case 'bottom':
      case 'bottom-left':
      case 'bottom-right':
        legendEl
          .attr('class', 'legend-container is-horizontal')
          .style('bottom', `${this.props.legendMargin.bottom}px`);

        if (this.props.legendPosition === 'bottom-left') {
          legendEl.style('left', `${this.props.legendMargin.left}px`);
        } else if (this.props.legendPosition === 'bottom-right') {
          legendEl.style('right', `${this.props.legendMargin.right}px`);
        } else {
          legendEl.style('left', '50%').style('transform', 'translateX(-50%)');
        }
        break;
      case 'right':
        legendEl
          .style('right', `${this.props.legendMargin.left}px`)
          .style('top', '50%')
          .style('transform', `translateY(-50%)`);
        break;
      case 'top':
      case 'top-left':
      case 'top-right':
        legendEl
          .attr('class', 'legend-container is-horizontal')
          .style('top', `${this.props.legendMargin.top}px`);

        if (this.props.legendPosition === 'top-left') {
          legendEl.style('left', `${this.props.legendMargin.left}px`);
        } else if (this.props.legendPosition === 'top-right') {
          legendEl.style('right', `${this.props.legendMargin.right}px`);
        } else {
          legendEl.style('left', '50%').style('transform', 'translateX(-50%)');
        }
        break;
    }
  }

  private drawMarkers(line: LineType, props: LineChartData): void {
    line.markers = line.g.append('g');

    line.markers.selectAll('.dot')
      .data(props.data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (dd: any) => this.x(dd.x))
      .attr('cy', (dd: any) => this.y(dd.y))
      .attr('r', props.markerSize)
      .attr('stroke', props.markerColor)
      .attr('class', 'dot')
      .attr('r', props.markerSize)
      .attr('fill', '#FFFFFF')
      .attr('stroke', props.markerColor)
      .attr('stroke-width', 1);

    line.markers.selectAll('.inner-dot').data(props.data)
      .enter().append('circle')
      .attr('class', 'inner-dot')
      .attr('cx', (dd: any) => this.x(dd.x))
      .attr('cy', (dd: any) => this.y(dd.y))
      .attr('r', props.markerSize - (props.markerSize / 2))
      .attr('fill', props.markerColor)
      .attr('stroke', props.markerColor)
      .attr('class', 'inner-dot');
  }

  private removeMarkers(): void {
    this.g.selectAll('.inner-dot').remove();
    this.g.selectAll('.dot').remove();
  }

  private checkLineValues(): boolean {
    if (!this.props || !this.data || !this.data.length) {
      return false;
    }

    if (!this.data.reduce((acc, curr) => acc.concat(curr.data), []).length) {
      return false;
    }

    return true;
  }

  private mouseEvents(): void {
    if (!this.props.interaction.enable) {
      return;
    }

    this.crosshairG
      .style('stroke', this.props.interaction.axisLineColor)
      .style('stroke-width', this.props.interaction.axisLineSize);

    this.rect
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('transform', `translate(${this.props.margin.left}, ${this.props.margin.top})`)
      .on('mouseout', () => {
        this.setMouseEventsSelectors('none');
      })
      .on('mouseover', () => {
        this.setMouseEventsSelectors();
      })
      .on('mousemove', (_, i, nodes) => {
        this.mouseMove(nodes[i]);
        this.onMouseMove(nodes[i]);
      })
      .on('click', (_, i, nodes) => this.onMouseClick(nodes[i]));

    this.svg
      .on('mouseout', () => {
        this.setMouseEventsSelectors('none');
      });
  }

  private setMouseEventsSelectors(display: null | 'none' = null): void {
    this.ngZone.runTask(() => this.tooltip.visible = display === 'none' ? false : true);
    this.mouseG.style('display', display);
    this.crosshairG.style('display', display);
  }

  private mouseMove(node: SVGElement): void {
    const data = this.data.reduce((acc, curr) => acc.concat(curr.data), []);
    const [x] = this.getBisect(node, data);

    if (this.props.interaction.axisLine) {
      this.crosshairG.select('.focus-line-x')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', this.height);
    }

    const yarr = [];
    let index = 0;
    this.mouseG.selectAll('.focus-circle').remove();
    this.data.forEach(l => {
      const [cx, cy, ii] = this.getBisect(node, l.data);
      if (this.props.interaction.tickMarker) {
        this.mouseG.append('circle')
          .attr('class', 'focus-circle')
          .attr('r', this.props.interaction.tickMarkerSize)
          .attr('fill', l.markerColor)
          .attr('opacity', .4)
          .attr('cx', cx)
          .attr('cy', cy);
      }
      yarr.push(cy);
      index = ii;
    });

    const [tx, ty] = [x, yarr.reduce((p, c) => p + c, 0) / yarr.length];
    if (this.props.interaction.tooltip) {
      this.ngZone.runOutsideAngular(() => this.showTooltip(tx, ty, index));
    }
  }

  private getBisect(node: any, data: any): [number, number, number] {
    const m = mouse(node);
    const mx = (this.x as any).invert(m[0]);
    const b = bisector((dd: any) => dd.x).left;
    const i = b(data, mx, 1);

    const d0 = data[i - 1] || { x: 0 };
    const d1 = data[i] || { x: 0 };
    const [d, j] = mx - d0.x > d1.x - mx ? [d1, i] : [d0, i - 1];

    return [this.x(d.x), this.y(d.y), j];
  }

  private onMouseClick(node: SVGElement): void {
    const data = this.data.reduce((acc, curr) => {
      const [, , j] = this.getBisect(node, curr.data);
      const props = { id: curr.id, color: curr.color };
      return {
        x: acc.x.concat({ ...props, value: curr.data[j].x }),
        y: acc.y.concat({ ...props, value: curr.data[j].y })
      };
    }, { x: [], y: [] });

    const evClick = new LineChartEventClick('click', data.x, data.y);
    this.events.emit(evClick);
  }

  private onMouseMove(node: SVGElement): void {
    const [mouseX, mouseY] = mouse(node as ContainerElement);
    const { x, y } = this.data.reduce((acc, curr) => {
      const [, , j] = this.getBisect(node, curr.data);
      const props = { id: curr.id, color: curr.color };
      return curr.data[j] ? {
        x: acc.x.concat({ ...props, value: curr.data[j].x }),
        y: acc.y.concat({ ...props, value: curr.data[j].y })
      } : acc;
    }, { x: [], y: [] });

    const evMouseMove = new LineChartEventMouseMove('mousemove', x, y, mouseX, mouseY);
    this.events.emit(evMouseMove);
  }

  private showTooltip(left: number, top: number, i: number): void {
    this.ngZone.runTask(() => {
      this.tooltip.visible = true;
      this.tooltip.title = this.data[0] && this.data[0].data[i] ?
        getFormattedValue(this.data[0].data[i].x, this.props.interaction.xFormat) : '';
      this.tooltip.items = this.data
        .reduce((acc, curr) => curr.data[i] ? acc.concat({ color: curr.markerColor, id: curr.id, value: curr.data[i].y }) : acc, [])
        .map(x => ({ ...x, color: hexToRgb(x.color) }));

      const tooltipEl = select(this.el).select('.tooltip-container');

      tooltipEl
        .on('mousemove', () => {
          this.tooltip.visible = true;
          this.mouseG.style('display', null);
          this.crosshairG.style('display', null);
          this.mouseMove(this.rect.node());
        })
        .on('click', () => this.onMouseClick(this.rect.node()))
        .on('mouseout', () => this.tooltip.visible = false);

      let l = left + this.props.margin.left + 20;
      tooltipEl.style('left', `${l}px`).style('top', `${top}px`);

      const rect = (tooltipEl.node() as any).getBoundingClientRect();
      if (rect.left + rect.width >= window.innerWidth) {
        l = left - rect.width + this.props.margin.left - 20;
      }

      tooltipEl.style('left', `${l}px`).style('top', `${top}px`);
    });
  }
}
