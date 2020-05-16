import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { RealtimeChartSettings } from 'src/app/shared/charts/realtime-chart/realtime-chart.interface';

@Component({
  selector: 'app-workers-modal',
  templateUrl: './workers-modal.component.html',
  styleUrls: ['./workers-modal.component.sass']
})
export class WorkersModalComponent implements OnInit {
  @Input() worker: Worker;

  realtimeChartOptions: RealtimeChartSettings = {
    margin: { top: 10, right: 0, bottom: 25, left: 25 },
    xGrid: { tickPadding: 10, tickNumber: 5 },
    yGrid: { min: 0, max: 100, tickNumber: 5, tickFormat: (v: number) => `${v}%`, tickPadding: 15 }
  };
  realtimeCpuChartOptions: RealtimeChartSettings = {
    ...this.realtimeChartOptions, lines: [{ color: '#4299e1', areaColor: '#4299e1' }]
  };
  realtimeMemoryChartOptions: RealtimeChartSettings = {
    ...this.realtimeChartOptions, lines: [{ color: '#f56565', areaColor: '#f56565' }]
  };

  constructor(
    public activeModal: ActiveModal
  ) { }

  ngOnInit(): void {
  }

}
