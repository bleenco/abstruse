import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-repo',
  templateUrl: './repo.component.html',
  styleUrls: ['./repo.component.sass']
})
export class RepoComponent implements OnInit {
  id!: number;

  constructor(public repos: ReposService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.repos.findByID(this.id);
  }
}
