import { Component, OnDestroy, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WindowService } from '../../services/window.service';
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
  area,
  event
} from 'd3';
import { isSameDay, compareAsc, format } from 'date-fns';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-line-chart',
  templateUrl: 'app-line-chart.component.html'
})
export class AppLineChartComponent implements OnDestroy, OnChanges {
  @Input() data: { success: {}, failed: {} };
  el: Element;
  tooltip: any;
  minDate: string;
  maxDate: string;
  sub: Subscription;

  constructor(private elementRef: ElementRef, private windowService: WindowService) {
    this.sub = this.windowService.resize
      .filter(x => !!this.el)
      .subscribe(e => {
        this.render();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('data' in changes) {
      this.render();
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  render() {
    this.el = this.elementRef.nativeElement.querySelector('.line-chart-container');
    select(this.el).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
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

    let successData = Object.keys(this.data.success).map(key => {
      return { date: parseTime(key), value: this.data.success[key] };
    });

    let failedData = Object.keys(this.data.failed).map(key => {
      return { date: parseTime(key), value: this.data.failed[key] };
    });

    successData.forEach(success => {
      const index = failedData.findIndex(d => isSameDay(new Date(d.date), new Date(success.date)));
      if (index === -1) {
        failedData.push({ date: success.date, value: 0 });
      }
    });

    failedData.forEach(failed => {
      const index = successData.findIndex(d => isSameDay(new Date(d.date), new Date(failed.date)));
      if (index === -1) {
        successData.push({ date: failed.date, value: 0 });
      }
    });

    successData = this.sortByKey(successData, 'date');
    failedData = this.sortByKey(failedData, 'date');

    const minMaxFormat = 'ddd D.M.';

    this.minDate = format(Math.min(...successData
      .concat(failedData).map(d => Number(format(d.date, 'x')))), minMaxFormat);
    this.maxDate = format(Math.max(...successData
      .concat(failedData).map(d => Number(format(d.date, 'x')))), minMaxFormat);

    if (!successData.length && !failedData.length) {
      return;
    }

    x.domain(extent(successData.concat(failedData), (d: any) => d.date));
    y.domain(extent(successData.concat(failedData), (d: any) => d.value));

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
    const successGradient = defs.append('linearGradient')
      .attr('id', 'successGradient')
      .attr('x1', '0%').attr('y1', '13%')
      .attr('x2', '0%').attr('y2', '100%');

    successGradient.append('stop')
      .attr('stop-color', '#2BB415')
      .attr('stop-opacity', '0.1')
      .attr('offset', 0);

    successGradient.append('stop')
      .attr('stop-color', 'rgba(90, 217, 70, 0.1)')
      .attr('stop-opacity', '0.1')
      .attr('offset', 1);

    const failedGradient = defs.append('linearGradient')
      .attr('id', 'failedGradient')
      .attr('x1', '0%').attr('y1', '13%')
      .attr('x2', '0%').attr('y2', '100%');

    failedGradient.append('stop')
      .attr('stop-color', '#f03e3e')
      .attr('stop-opacity', '0.1')
      .attr('offset', 0);

    failedGradient.append('stop')
      .attr('stop-color', 'rgba(240, 62, 62, 0.1)')
      .attr('stop-opacity', '0.1')
      .attr('offset', 1);

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(axisLeft(y).tickSizeInner(-width).tickSizeOuter(0).tickPadding(10));

    g.append('path')
      .attr('d', l(successData as any))
      .attr('fill', 'none')
      .attr('stroke', '#2BB415')
      .attr('stroke-width', '2px');

    g.append('path')
      .attr('d', a(successData as any))
      .attr('fill', 'url(#successGradient)');

    g.selectAll('dot')
      .data(successData)
      .enter().append('circle')
      .attr('r', 3)
      .attr('cx', (d: any) => x(d.date))
      .attr('cy', (d: any) => y(d.value))
      .attr('fill', 'white')
      .attr('stroke', '#2BB415')
      .attr('stroke-width', 2);

    g.append('path')
      .attr('d', l(failedData as any))
      .attr('fill', 'none')
      .attr('stroke', '#f03e3e')
      .attr('stroke-width', '2px');

    g.append('path')
      .attr('d', a(failedData as any))
      .attr('fill', 'url(#failedGradient)');

    g.selectAll('dot')
      .data(failedData)
      .enter().append('circle')
      .attr('r', 3)
      .attr('cx', (d: any) => x(d.date))
      .attr('cy', (d: any) => y(d.value))
      .attr('fill', 'white')
      .attr('stroke', '#f03e3e')
      .attr('stroke-width', 2);
  }

  sortByKey(array, key) {
    return array.sort((a, b) => {
      const x = new Date(a[key]);
      const y = new Date(b[key]);
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
}
