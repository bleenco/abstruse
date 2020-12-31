import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-repo',
  templateUrl: './repo.component.html',
  styleUrls: ['./repo.component.sass']
})
export class RepoComponent implements OnInit {
  id!: number;
  title!: string;

  constructor(
    public reposService: ReposService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.reposService.findByID(this.id);
    this.setTitle();
    this.router.events
      .pipe(
        filter(ev => ev instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe(() => this.setTitle());
  }

  private setTitle(): void {
    switch (this.router.url) {
      case `/repos/${this.id}/builds`:
        this.title = 'Latest Builds';
        break;
      case `/repos/${this.id}/branches`:
        this.title = 'Branches';
        break;
      case `/repos/${this.id}/pull-requests`:
        this.title = 'Pull Requests';
        break;
      case `/repos/${this.id}/settings`:
        this.title = 'Settings';
        break;
    }
  }
}
