import { Component, OnInit, Input } from '@angular/core';
import { Repo } from '../shared/repo.model';
import { ReposService } from '../shared/repos.service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-repo-item',
  templateUrl: './repo-item.component.html',
  styleUrls: ['./repo-item.component.sass']
})
export class RepoItemComponent implements OnInit {
  @Input() repo!: Repo;

  constructor(private reposService: ReposService) {}

  ngOnInit(): void {}

  onActiveChange(): void {
    this.reposService
      .setActive(this.repo.id as number, this.repo.active as boolean)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {},
        () => {
          this.repo.active = !this.repo.active;
        }
      );
  }
}
