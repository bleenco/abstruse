import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { RealtimeChartSettings } from 'src/app/shared/charts/realtime-chart/realtime-chart.interface';
import { Subscription } from 'rxjs';

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
    ...this.realtimeChartOptions, lines: [{ color: '#F6AB2F', areaColor: '#F6AB2F' }]
  };
  realtimeMemoryChartOptions: RealtimeChartSettings = {
    ...this.realtimeChartOptions, lines: [{ color: '#22D171', areaColor: '#22D171' }]
  };

  constructor(
    public activeModal: ActiveModal
  ) { }

  ngOnInit(): void {
  }

}
