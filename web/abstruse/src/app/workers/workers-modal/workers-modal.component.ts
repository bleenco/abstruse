import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { RealtimeChartOptions } from 'ngx-graph';

@Component({
  selector: 'app-workers-modal',
  templateUrl: './workers-modal.component.html',
  styleUrls: ['./workers-modal.component.sass']
})
export class WorkersModalComponent implements OnInit {
  @Input() worker: Worker;

  realtimeChartOptions: RealtimeChartOptions = {
    height: 150,
    margin: { top: 10, right: 0, bottom: 25, left: 30 },
    xGrid: { tickPadding: 10, tickNumber: 12, opacity: 0 },
    yGrid: { min: 0, max: 100, tickNumber: 5, tickFormat: (v: number) => `${v}%`, tickPadding: 15 },
    timeSlots: 120
  };
  realtimeCpuChartOptions: RealtimeChartOptions = {
    ...this.realtimeChartOptions, lines: [{ color: '#48bb78', areaColor: '#48bb78', areaOpacity: .45 }]
  };
  realtimeMemoryChartOptions: RealtimeChartOptions = {
    ...this.realtimeChartOptions, lines: [{ color: '#48bb78', areaColor: '#48bb78', areaOpacity: .45 }]
  };

  constructor(
    public activeModal: ActiveModal
  ) { }

  ngOnInit(): void {
  }

}
