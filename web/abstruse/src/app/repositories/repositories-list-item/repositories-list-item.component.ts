import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-repositories-list-item',
  templateUrl: './repositories-list-item.component.html',
  styleUrls: ['./repositories-list-item.component.sass']
})
export class RepositoriesListItemComponent implements OnInit {
  @Input() repo: any;

  constructor() { }

  ngOnInit() { }

}
