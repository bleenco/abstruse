import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { Repo } from '../shared/repo.model';

@Component({
  selector: 'app-repos-list',
  templateUrl: './repos-list.component.html',
  styleUrls: ['./repos-list.component.sass']
})
export class ReposListComponent implements OnInit {
  repos: Repo[] = [];
  fetching: boolean;

  constructor(
    private reposService: ReposService
  ) { }

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.fetching = true;
    this.reposService.list()
      .subscribe(resp => {
        this.repos = resp;
      }, err => {
        console.log(err);
        this.repos = [];
        this.fetching = false;
      }, () => {
        this.fetching = false;
      });
  }
}
