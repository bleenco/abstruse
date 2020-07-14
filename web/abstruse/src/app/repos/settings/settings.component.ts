import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  constructor(public reposService: ReposService) {}

  ngOnInit(): void {
    this.findHooks();
  }

  findHooks(): void {
    this.reposService.findHooks(1).subscribe(
      resp => {
        console.log(resp);
      },
      err => {
        console.error(err);
      }
    );
  }
}
