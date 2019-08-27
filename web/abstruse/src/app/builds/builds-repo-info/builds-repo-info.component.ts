import { Component, OnInit, Input } from '@angular/core';
import { Repo } from 'src/app/repositories/shared/repo.model';

@Component({
  selector: 'app-builds-repo-info',
  templateUrl: './builds-repo-info.component.html',
  styleUrls: ['./builds-repo-info.component.sass']
})
export class BuildsRepoInfoComponent implements OnInit {
  @Input() repo: Repo;

  constructor() { }

  ngOnInit() { }
}
