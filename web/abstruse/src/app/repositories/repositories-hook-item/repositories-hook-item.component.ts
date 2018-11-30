import { Component, OnInit, Input } from '@angular/core';
import { Hook } from '../shared/hook.model';

@Component({
  selector: 'app-repositories-hook-item',
  templateUrl: './repositories-hook-item.component.html',
  styleUrls: ['./repositories-hook-item.component.sass']
})
export class RepositoriesHookItemComponent implements OnInit {
  @Input() hook: Hook;

  constructor() { }

  ngOnInit() { }
}
