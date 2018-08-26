import { Component, OnInit, Input } from '@angular/core';
import { Repository } from '../shared/repository.model';
import { RepositoriesService } from '../shared/repositories.service';

@Component({
  selector: 'app-repositories-repo-item',
  templateUrl: './repositories-repo-item.component.html',
  styleUrls: ['./repositories-repo-item.component.sass']
})
export class RepositoriesRepoItemComponent implements OnInit {
  @Input() repo: Repository;

  constructor(public service: RepositoriesService) { }

  ngOnInit() { }
}
