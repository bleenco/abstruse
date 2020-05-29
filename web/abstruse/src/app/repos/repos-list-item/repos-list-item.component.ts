import { Component, OnInit, Input } from '@angular/core';
import { Repo } from '../shared/repo.model';

@Component({
  selector: 'app-repos-list-item',
  templateUrl: './repos-list-item.component.html',
  styleUrls: ['./repos-list-item.component.sass']
})
export class ReposListItemComponent implements OnInit {
  @Input() repo: Repo;

  constructor() { }

  ngOnInit(): void { }
}
