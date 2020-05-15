import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { max, min } from 'd3-array';
import { Axis, axisBottom, axisLeft } from 'd3-axis';
import { easeLinear } from 'd3-ease';
import { scaleLinear, ScaleLinear, scaleTime, ScaleTime } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { area, Area, line, Line } from 'd3-shape';
import { interrupt, transition } from 'd3-transition';
import { Subscription, timer } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ResizeService } from '../../providers/resize.service';
import { curveTypeMapping, defaultRealtimeChartSettings, RealtimeChartData, RealtimeChartSettings } from './realtime-chart.interface';

@Component({
  selector: 'app-realtime-chart',
  templateUrl: './realtime-chart.component.html',
  styleUrls: ['./realtime-chart.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealtimeChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: RealtimeChartData[][] = [];
  @Input() options: RealtimeChartSettings = {};

  duration = 1000;
  now: Date;
  lastUpdate: Date;
  id = Math.random().toString(36).slice(-5);

  dataValues: RealtimeChartData[][] = [];
  el: HTMLElement;
  width: number;
  height: number;
  x: ScaleTime<number, number>;
  y: ScaleLinear<number, number>;
  line: Line<[number, number]>;
  linePaths: Selection<SVGGElement, unknown, null, undefined>[];
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  g: Selection<SVGGElement, unknown, null, undefined>;
  xAxis: Selection<SVGGElement, unknown, null, undefined>;
  yAxis: Selection<SVGGElement, unknown, null, undefined>;
  area: Area<[number, number]>;
  areaPaths: Selection<SVGGElement, unknown, null, undefined>[];
  clipPath: Selection<SVGRectElement, unknown, null, undefined>;
  clipPathURL: string;
  subs: Subscription = new Subscription();
  transition = transition(`${this.id}-transition`).duration(this.duration).ease(easeLinear);
  inited = false;

  constructor(
    public elementRef: ElementRef,
    public resizeService: ResizeService,
    public eventManager: EventManager
  ) { }

  ngOnInit() {
    this.initSettings();
    this.subs.add(this.resizeService.onResize$.subscribe(() => this.displayLoadingOverlay()));
    this.subs.add(this.resizeService.onResize$.pipe(debounceTime(500)).subscribe(() => this.onResize()));
    this.subs.add(
      timer(0, this.duration)
        .subscribe(() => {
          this.lastUpdate = new Date();
          this.updateData();
        })
    );
    this.eventManager.addGlobalEventListener('document', 'visibilitychange', this.onVisibilityChange.bind(this));

    this.now = new Date(Date.now() - this.duration);
    this.updateData();

    this.initChart();
    this.displayLoadingOverlay();
    this.inited = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.options && !!this.el) {
      this.initSettings();
      this.redrawChart();
    }
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }

    try {
      interrupt(this.transition.node(), `${this.id}-transition`);
    } catch { }
  }

  initChart(): void {
    this.el = this.elementRef.nativeElement.querySelector('.realtime-chart-container');
    this.svg = select(this.el).append('svg');
    this.g = this.svg.append('g');
    this.clipPath = this.svg.append('defs').append('clipPath')
      .attr('id', `${this.id}-clip`)
      .append('rect')
      .attr('transform', `translate(0, 0)`);
    this.clipPathURL = `url(${location.href}#${this.id}-clip)`;

    this.setDimensions();
    this.drawChart();
    this.tick();
  }

  private updateData(): void {
    const now = new Date();
    const from = now.getTime() - (this.duration * this.options.timeSlots);

    this.dataValues = (this.data || [])
      .map(data => {
        data = data.filter(d => d.date.getTime() > from);

        const last = data[data.length - 1] || { date: now, value: -1 };
        const nb = Math.round((now.getTime() - last.date.getTime()) / 1000);
        data = [
          ...data,
          ...[...new Array(nb)].map((_, i) => ({ ...last, date: new Date(last.date.getTime() + this.duration * (i + 1)) })),
          ...[{ date: new Date(now.getTime() + this.duration), value: last.value }]
        ];

        const first = data[0] || { date: now, value: -1 };
        data = this.options.timeSlots - data.length ?
          [
            ...[...new Array(this.options.timeSlots)]
              .map((_, i) => ({ date: new Date(first.date.getTime() - ((this.options.timeSlots - i + 1) * this.duration)), value: -1 })),
            ...data
          ] : data;

        return data;
      });
  }

  private drawChart(): void {
    this.setDomains();

    this.line = line()
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.value));

    this.area = area()
      .x((d: any) => this.x(d.date))
      .y1((d: any) => this.y(d.value))
      .y0(this.height);

    this.drawAxes();

    this.linePaths = Array.from(new Array(this.dataValues.length), (x: number, i: number) => {
      const linePath = this.g
        .append('g')
        .attr('clip-path', this.clipPathURL)
        .append('path')
        .datum(this.dataValues[i])
        .attr('class', 'line')
        .attr('d', this.line.curve(curveTypeMapping[this.options.lines[i].curve]) as any)
        .attr('stroke', this.options.lines[i].color)
        .attr('stroke-opacity', this.options.lines[i].opacity)
        .attr('stroke-width', this.options.lines[i].lineWidth)
        .style('shape-rendering', 'geometricPrecision')
        .style('fill', 'none');

      if (this.options.lines[i] && this.options.lines[i].area) {
        this.areaPaths = this.areaPaths || [];
        this.areaPaths[i] = this.g
          .append('g')
          .attr('clip-path', this.clipPathURL)
          .append('path')
          .datum(this.dataValues[i])
          .attr('class', 'area')
          .attr('d', this.area.curve(curveTypeMapping[this.options.lines[i].curve]) as any)
          .style('fill', this.options.lines[i].areaColor)
          .style('fill-opacity', this.options.lines[i].areaOpacity);
      }

      return linePath;
    });
  }

  private redrawChart(): void {
    this.g.selectAll('*').remove();
    this.drawChart();
  }

  tick(): void {
    try {
      this.transition.transition();
    } catch {
      this.transition = transition(`${this.id}-transition`).duration(this.duration).ease(easeLinear);
    }

    this.transition = this.transition.each(() => {
      this.now = new Date();
      this.setDomains();

      this.linePaths.forEach((path, i: number) => {
        path
          .attr('d', this.line(this.dataValues[i] as any))
          .attr('transform', null)
          .transition().duration(this.duration).ease(easeLinear)
          .attr('transform', `translate(${this.x(this.now.getTime() - (this.options.timeSlots - 1) * this.duration)}, 0)`);

        if (this.options.lines[i] && this.options.lines[i].area && this.areaPaths && this.areaPaths[i]) {
          this.areaPaths[i]
            .attr('d', this.area(this.dataValues[i] as any))
            .attr('transform', null)
            .transition().duration(this.duration).ease(easeLinear)
            .attr('transform', `translate(${this.x(this.now.getTime() - (this.options.timeSlots - 1) * this.duration)}, 0)`);
        }
      });

      const { y, x } = this.getAxesData();

      if (this.options.xGrid.enable) {
        this.xAxis
          .transition().duration(this.duration).ease(easeLinear)
          .call(x)
          .attr('transform', `translate(0, ${this.height})`);
      }

      if (this.options.yGrid.enable) {
        this.yAxis.call(y);
      }

      this.styleAxes();

      if (!this.inited) {
        this.hideLoadingOverlay();
        this.inited = true;
      }
    })
      .transition()
      .on('start', () => this.tick());
  }

  private update(): void {
    this.displayLoadingOverlay();

    try {
      this.transition.on('cancel', () => {
        const diff = this.duration - (new Date().getTime() - this.lastUpdate.getTime());
        this.redrawChart();
        this.inited = false;
        setTimeout(() => this.tick(), diff);
      });

      interrupt(this.transition.node(), `${this.id}-transition`);
      this.now = new Date();
    } catch {
      const diff = this.duration - (new Date().getTime() - this.lastUpdate.getTime());

      setTimeout(() => {
        this.now = new Date();
        this.redrawChart();
        this.tick();
        this.inited = false;
      }, diff);
    }
  }

  private setDomains(): void {
    this.x = scaleTime().range([0, this.width]);
    this.y = scaleLinear().range([this.height, 0]);
    this.x.domain([this.now.getTime() - (this.options.timeSlots - 2) * this.duration, this.now.getTime() - (this.duration * 2)]);

    const values = this.dataValues.reduce((acc, curr) => acc.concat(curr.map((d: any) => d.value)), []);
    const [minv, maxv] = [Number(min(values as any)), Number(max(values as any))];
    const factor = (maxv - minv) * .05;
    const [ymin, ymax] = [
      this.options.yGrid.min === 'auto' ? Number(minv) - factor : this.options.yGrid.min,
      this.options.yGrid.max === 'auto' ? Number(maxv) + factor : this.options.yGrid.max
    ];
    this.y.domain([ymin, ymax]);
  }

  private drawAxes(): void {
    this.setDomains();

    const { y, x } = this.getAxesData();

    if (this.options.xGrid.enable) {
      this.xAxis = this.g.append('g')
        .attr('class', 'x axis')
        .call(x)
        .attr('transform', `translate(0, ${this.height})`);
    }

    if (this.options.yGrid.enable) {
      this.yAxis = this.g.append('g')
        .attr('class', 'y axis')
        .call(y);
    }

    this.styleAxes();
  }

  private getAxesData(): {
    y: Axis<number | {
      valueOf(): number;
    }>;
    x: Axis<number | Date | {
      valueOf(): number;
    }>;
  } {
    return {
      y: axisLeft(this.y).tickSize(-this.width).tickPadding(this.options.yGrid.tickPadding).ticks(this.options.yGrid.tickNumber,
        typeof this.options.yGrid.tickFormat !== 'function' ? this.options.yGrid.tickFormat : null
      )
        .tickFormat(typeof this.options.yGrid.tickFormat === 'function' ? this.options.yGrid.tickFormat as any : null),
      x: axisBottom(this.x).tickSizeInner(-this.height).tickSizeOuter(0).tickPadding(this.options.xGrid.tickPadding)
        .ticks(this.options.xGrid.tickNumber, this.options.xGrid.tickFormat)
    };
  }

  private styleAxes(): void {
    if (this.options.xGrid.enable) {
      this.xAxis.selectAll('g.tick')
        .select('line')
        .style('shape-rendering', 'crispEdges')
        .style('fill', 'none')
        .style('stroke', this.options.xGrid.color)
        .style('stroke-width', this.options.xGrid.size)
        .style('stroke-dasharray', this.options.xGrid.dashed ? '3 3' : '0')
        .style('opacity', this.options.xGrid.opacity);

      this.xAxis.selectAll('g.tick')
        .selectAll('text')
        .attr('text-anchor', this.options.xGrid.tickFontAnchor)
        .style('fill', this.options.xGrid.tickFontColor)
        .style('font-size', this.options.xGrid.tickFontSize)
        .style('font-family', this.options.xGrid.tickFontFamily)
        .style('font-weight', this.options.xGrid.tickFontWeight);
    }

    if (this.options.yGrid.enable) {
      this.yAxis.selectAll('g.tick')
        .select('line')
        .style('shape-rendering', 'crispEdges')
        .style('fill', 'none')
        .style('stroke', this.options.yGrid.color)
        .style('stroke-width', this.options.yGrid.size)
        .style('stroke-dasharray', this.options.yGrid.dashed ? '3 3' : '0')
        .style('opacity', this.options.yGrid.opacity);

      this.yAxis.selectAll('g.tick')
        .selectAll('text')
        .attr('text-anchor', this.options.yGrid.tickFontAnchor)
        .style('fill', this.options.yGrid.tickFontColor)
        .style('font-size', this.options.yGrid.tickFontSize)
        .style('font-family', this.options.yGrid.tickFontFamily)
        .style('font-weight', this.options.yGrid.tickFontWeight);
    }

    this.svg.selectAll('.axis')
      .select('path')
      .style('display', 'none');
  }

  private onResize(): void {
    this.displayLoadingOverlay();
    this.setDimensions();
    this.update();
  }

  private setDimensions(): void {
    const w = this.options.width || this.el.clientWidth;
    const h = this.options.height || this.el.clientHeight;
    this.width = w - this.options.margin.left - this.options.margin.right;
    this.height = h - this.options.margin.top - this.options.margin.bottom;

    this.svg
      .attr('width', this.width + this.options.margin.left + this.options.margin.right)
      .attr('height', this.height + this.options.margin.top + this.options.margin.bottom);

    this.g
      .attr('transform', `translate(${this.options.margin.left}, ${this.options.margin.top})`);

    this.clipPath
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private onVisibilityChange(e: Event): void {
    if ((e.target as Document).visibilityState === 'hidden') {
      this.displayLoadingOverlay();
      interrupt(this.transition.node(), `${this.id}-transition`);
      this.inited = true;
    } else if ((e.target as Document).visibilityState === 'visible') {
      this.update();
    }
  }

  private displayLoadingOverlay(): void {
    [].forEach.call([
      this.elementRef.nativeElement.querySelector('.realtime-chart-container'),
      this.elementRef.nativeElement.querySelector('.realtime-chart-overlay')
    ], (el: HTMLElement) => {
      if (!el.classList.contains('is-loading')) {
        el.classList.add('is-loading');
      }
    });
  }

  private hideLoadingOverlay(): void {
    [].forEach.call([
      this.elementRef.nativeElement.querySelector('.realtime-chart-container'),
      this.elementRef.nativeElement.querySelector('.realtime-chart-overlay')
    ], (el: HTMLElement) => {
      if (el.classList.contains('is-loading')) {
        el.classList.remove('is-loading');
      }
    });
  }

  private initSettings(): void {
    this.options = {
      ...defaultRealtimeChartSettings,
      ...this.options,
      margin: { ...defaultRealtimeChartSettings.margin, ...this.options.margin || {} }
    };

    this.options.xGrid = { ...defaultRealtimeChartSettings.xGrid, ...this.options.xGrid || {} };
    this.options.yGrid = { ...defaultRealtimeChartSettings.yGrid, ...this.options.yGrid || {} };

    this.options.lines = this.options.lines || [];

    (this.data || []).forEach((d: any, i: number) => {
      this.options.lines[i] = {
        ...{
          color: this.options.colors[i],
          opacity: 1,
          lineWidth: 2,
          area: true,
          areaColor: this.options.colors[i],
          areaOpacity: .1,
          curve: 'basis'
        },
        ...this.options.lines[i]
      };
    });
  }
}
