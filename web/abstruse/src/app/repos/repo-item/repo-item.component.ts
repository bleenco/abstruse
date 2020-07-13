import { Component, OnInit, Input } from '@angular/core';
import { Repo } from '../shared/repo.model';

@Component({
  selector: 'app-repo-item',
  templateUrl: './repo-item.component.html',
  styleUrls: ['./repo-item.component.sass']
})
export class RepoItemComponent implements OnInit {
  @Input() repo!: Repo;

  constructor() {}

  ngOnInit(): void {}
}
