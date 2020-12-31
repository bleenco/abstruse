import { Component, Input, OnInit } from '@angular/core';
import { RealtimeCanvasChartOptions } from 'ngx-graph';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Worker } from '../shared/worker.model';

@Component({
  selector: 'app-worker-modal',
  templateUrl: './worker-modal.component.html',
  styleUrls: ['./worker-modal.component.sass']
})
export class WorkerModalComponent implements OnInit {
  @Input() worker!: Worker;

  realtimeChartOptions: RealtimeCanvasChartOptions = {
    height: 150,
    margin: { top: 10, right: 0, bottom: 25, left: 30 },
    xGrid: { tickPadding: 10, tickNumber: 5 },
    yGrid: {
      min: 0,
      max: 100,
      tickNumber: 5,
      tickFormat: (v: string | number) => `${v}%`,
      tickPadding: 15
    },
    timeSlots: 120
  };
  realtimeCpuChartOptions: RealtimeCanvasChartOptions = {
    ...this.realtimeChartOptions,
    lines: [{ color: '#48bb78', areaColor: '#48bb78' }]
  };
  realtimeMemoryChartOptions: RealtimeCanvasChartOptions = {
    ...this.realtimeChartOptions,
    lines: [{ color: '#48bb78', areaColor: '#48bb78' }]
  };

  constructor(public activeModal: ActiveModal) {}

  ngOnInit(): void {}
}
