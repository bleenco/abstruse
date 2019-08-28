import { Component, OnInit, Input } from '@angular/core';
import { Repo } from 'src/app/repositories/shared/repo.model';
import { BuildService } from '../shared/build.service';

@Component({
  selector: 'app-builds-repo-info',
  templateUrl: './builds-repo-info.component.html',
  styleUrls: ['./builds-repo-info.component.sass']
})
export class BuildsRepoInfoComponent implements OnInit {
  @Input() repo: Repo;
  processing: boolean;

  constructor(
    public buildService: BuildService
  ) { }

  ngOnInit() { }

  triggerBuild(): void {
    this.processing = true;
    this.buildService.triggerBuild().subscribe(resp => {
      console.log(resp);
    }, err => {
      console.error(err);
    }, () => {
      this.processing = false;
    });
  }
}
