import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EnvVariable } from './env-variable.model';

@Component({
  selector: 'app-settings-envs',
  templateUrl: './settings-envs.component.html',
  styleUrls: ['./settings-envs.component.sass']
})
export class SettingsEnvsComponent implements OnInit {
  id!: number;
  envs: EnvVariable[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.envs = [
      { id: 1, key: 'SSH_ACCESS_TOKEN', value: 'd131dd02c5e6eec4', secret: false },
      { id: 2, key: 'SSH_PRIVATE_KEY', value: '', secret: true }
    ];
  }
}
