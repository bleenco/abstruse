import { Component, OnInit, Input } from '@angular/core';
import { Repo } from '../shared/repo.model';

@Component({
  selector: 'app-repositories-list-item',
  templateUrl: './repositories-list-item.component.html',
  styleUrls: ['./repositories-list-item.component.sass']
})
export class RepositoriesListItemComponent implements OnInit {
  @Input() repo: Repo;

  constructor() { }

  ngOnInit() { }

}
