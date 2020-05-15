import { Component, OnInit, Input, ElementRef, OnChanges, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { PieChartSettings, PieChartData, defaultPieChartSettings } from './pie-chart.interface';
import { pie, arc, Pie, Arc, DefaultArcObject, PieArcDatum } from 'd3-shape';
import { select, Selection } from 'd3-selection';
import { scaleOrdinal, ScaleOrdinal } from 'd3-scale';
import { transition } from 'd3-transition';
import { interpolate } from 'd3-interpolate';
import { ResizeService } from '../../providers/resize.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() options: PieChartSettings;
  @Input() data: PieChartData[];

  el: HTMLElement;
  width: number;
  height: number;
  pie: Pie<any, number | { valueOf(): number; }>;
  arc: Arc<any, DefaultArcObject>;
  colors: ScaleOrdinal<string, unknown>;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  g: Selection<SVGGElement, unknown, null, undefined>;
  sliceG: Selection<SVGGElement, unknown, null, undefined>;
  labelG: Selection<SVGGElement, unknown, null, undefined>;
  arcs: PieArcDatum<number | { valueOf(): number; }>[] = [];
  resizeSubscription: Subscription;

  constructor(
    public elementRef: ElementRef,
    public resizeService: ResizeService
  ) { }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.ui-pie-chart-container');
    this.render();

    this.resizeSubscription = this.resizeService.onResize$
      .pipe(debounceTime(500))
      .subscribe(() => this.render(true));
  }

  ngOnChanges() {
    if (!this.el) {
      return;
    }

    this.render();
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  private render(skipTransitions: boolean = false): void {
    this.options = {
      ...defaultPieChartSettings,
      ...this.options,
      margin: { ...defaultPieChartSettings.margin, ...this.options.margin }
    };

    const w = this.options.width || this.el.clientWidth;
    const h = this.options.height || this.el.clientHeight;
    this.width = w - this.options.margin.left - this.options.margin.right;
    this.height = h - this.options.margin.top - this.options.margin.bottom;

    this.pie = pie()
      .padAngle(this.options.padAngle / 100)
      .sort(null)
      .value((d: any) => d.value);

    const radius = Math.min(this.width, this.height) / 2;
    this.arc = arc()
      .innerRadius(radius * this.options.innerRadius)
      .outerRadius(radius)
      .cornerRadius(this.options.borderRadius);

    this.colors = scaleOrdinal()
      .domain(this.data.map((d: PieChartData) => d.id))
      .range(this.options.colors.reduce((acc, curr, i) => {
        if (this.data && this.data[i] && this.data[i].color) {
          acc = acc.concat(this.data[i].color);
        }
        return acc.concat(curr);
      }, []));

    this.svg = this.svg || select(this.el).append('svg');
    this.svg
      .attr('width', this.width + this.options.margin.left + this.options.margin.right)
      .attr('height', this.height + this.options.margin.top + this.options.margin.bottom);

    this.g = this.g || this.svg.append('g');
    this.g.attr('transform', `translate(${this.width / 2 + this.options.margin.left}, ${this.height / 2 + this.options.margin.top})`);
    this.sliceG = this.sliceG || this.g.append('g');
    this.labelG = this.labelG || this.g.append('g');

    const trans = this.options.transitions ? transition().duration(this.options.transitionsDuration) : null;

    if (!trans || skipTransitions) {
      this.sliceG
        .selectAll('.slice')
        .data(this.pie(this.data as any), (d: any) => d.data.id)
        .join('path')
        .attr('class', 'slice')
        .attr('fill', (d: any) => this.colors(d.data.id) as any)
        .attr('d', this.arc as any);

      if (this.options.labels) {
        this.labelG.
          selectAll('.label')
          .data(this.pie(this.data as any), (d: any) => d.data.id)
          .join('text')
          .attr('class', 'label')
          .attr('font-size', 12)
          .attr('text-anchor', 'middle')
          .attr('fill', this.options.textColor)
          .text((d: any) => d.data.id)
          .attr('transform', (d: any) => `translate(${this.arc.centroid(d)})`);
      }

      this.arcs = this.pie(this.data as any);
    } else {
      this.sliceG
        .selectAll('.slice')
        .data(this.pie(this.data as any), (d: any) => d.data.id)
        .join('path')
        .attr('class', 'slice')
        .attr('fill', (d: any) => this.colors(d.data.id) as any)
        .transition(trans)
        .attrTween('d', (d: any, i: number) => {
          const ipolate = interpolate(this.arcs[i] || d, d);
          return (t: number) => this.arc(ipolate(t));
        })
        .on('end', () => this.arcs = this.pie(this.data as any));

      if (this.options.labels) {
        this.labelG.
          selectAll('.label')
          .data(this.pie(this.data as any), (d: any) => d.data.id)
          .join('text')
          .attr('class', 'label')
          .attr('font-size', 12)
          .attr('text-anchor', 'middle')
          .attr('fill', this.options.textColor)
          .text((d: any) => d.data.id)
          .transition(trans)
          .attrTween('transform', (d: any, i: number, el: any) => {
            const ipolate = interpolate(this.arcs[i] || d, d);
            return (t: number) => `translate(${this.arc.centroid(ipolate(t))})`;
          });
      }
    }

    this.sliceG.exit().remove();
    this.labelG.exit().remove();
  }
}
