import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import {
  select,
  scaleTime,
  scaleLinear,
  scaleOrdinal,
  timeParse,
  line,
  curveLinear,
  extent,
  min,
  max,
  axisBottom,
  axisLeft,
  area
} from 'd3';

@Component({
  selector: 'app-line-chart',
  templateUrl: 'app-line-chart.component.html'
})
export class AppLineChartComponent implements OnInit, OnDestroy {
  data: any[];
  el: Element;

  constructor(private elementRef: ElementRef) {
    this.data = [
      { date: '2017-01-01', value: 0 },
      { date: '2017-02-01', value: 10 },
      { date: '2017-03-01', value: 5 },
      { date: '2017-04-01', value: 7 },
      { date: '2017-05-01', value: 24 },
      { date: '2017-06-01', value: 28 },
      { date: '2017-07-01', value: 32 },
      { date: '2017-08-01', value: 28 },
      { date: '2017-09-01', value: 20 },
      { date: '2017-10-01', value: 14 },
      { date: '2017-11-01', value: 6 },
      { date: '2017-12-01', value: 12 }
    ];
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.line-chart-container');
    this.render();
  }

  ngOnDestroy() { }

  render() {
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const style: CSSStyleDeclaration = getComputedStyle(this.el);
    const width = parseInt(style.width, 10) - margin.left - margin.right;
    const height = parseInt(style.height, 10) - margin.top - margin.bottom;

    const svg = select(this.el).append('svg').attr('width', '100%').attr('height', '100%');
    const g = svg.append('g')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const parseTime = timeParse('%Y-%m-%d');

    const x = scaleTime().rangeRound([0, width]);
    const y = scaleLinear().rangeRound([height, 0]);

    this.data = this.data.map(d => {
      return { date: parseTime(d.date), value: d.value };
    });

    x.domain(extent(this.data, (d: any) => d.date));
    y.domain(extent(this.data, (d: any) => d.value));

    const l = line()
      .curve(curveLinear)
      .x((d: any) => x(d.date))
      .y((d: any) => y(d.value));

    const a = area()
      .curve(curveLinear)
      .x((d: any) => x(d.date))
      .y1((d: any) => y(d.value));

    a.y0(y(0));

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'mainGradient')
      .attr('x1', '0%').attr('y1', '13%')
      .attr('x2', '0%').attr('y2', '100%');

    gradient.append('stop')
      .attr('stop-color', '#00ACFF')
      .attr('stop-opacity', '0.1')
      .attr('offset', 0);

    gradient.append('stop')
      .attr('stop-color', 'rgba(0,172,255,0.00)')
      .attr('stop-opacity', '0.1')
      .attr('offset', 1);

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('fill', 'white')
      .text('Temperature, ºC');

    g.append('path')
      .attr('d', l(this.data))
      .attr('fill', 'none')
      .attr('stroke', '#00AAFF')
      .attr('stroke-width', '2px');

    g.append('path')
      .attr('d', a(this.data))
      .attr('fill', 'url(#mainGradient)');
  }
}
