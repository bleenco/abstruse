import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-user',
  templateUrl: 'app-user.component.html'
})
export class AppUserComponent implements OnInit {
  loading: boolean;
  user: any;
  loggedUser: any;
  avatarUrl: string;
  repositories: any;
  restrictedRepositories: any;
  password: string;
  yesNoOptions: { key: number, value: string }[];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private config: ConfigService
  ) {
    this.loading = true;
    this.user = {};
    this.yesNoOptions = [ { key: 0, value: 'No' }, { key: 1, value: 'Yes' } ];
  }

  ngOnInit() {
    this.loggedUser = this.auth.getData();
    this.route.params
    .switchMap((params: Params) => this.api.getUser(params.id))
    .subscribe((user: any) => {
      if (user) {
        this.user = user;
      }

      this.avatarUrl = this.config.url + user.avatar;
      this.loading = false;
    });

    this.route.params
      .switchMap((params: Params) => this.api.getRepositories('', params.id))
      .subscribe(repositories => {
        this.repositories =
          repositories.filter(r => r.permissions.findIndex(p => p.permission) !== -1);
        this.repositories.forEach((repo: any, i) => {
          this.api.getBadge(repo.id).subscribe(badge => {
            if (badge.ok) {
              this.repositories[i].status_badge = badge._body;
            }
          });
        });

        this.restrictedRepositories =
          repositories.filter(r => r.permissions.findIndex(p => !p.permission) !== -1);
        this.restrictedRepositories.forEach((repo: any, i) => {
          this.api.getBadge(repo.id).subscribe(badge => {
            if (badge.ok) {
              this.restrictedRepositories[i].status_badge = badge._body;
            }
          });
        });
      });
  }

  gotoRepository(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.router.navigate(['repo', id]);
  }

  updateRepositoryPermissions(userId: number, repositoryId: number, permission: boolean): void {
    let data = { user: userId, repository: repositoryId, permission: permission };
    this.api.updateRepositoryPermission(data).subscribe(event => {
      if (event) {
        if (!permission) {
          let index = this.repositories.findIndex(r => r.id === repositoryId);
          if (index !== -1) {
            this.restrictedRepositories =
              this.restrictedRepositories.concat(this.repositories[index]);
            this.repositories.splice(index, 1);
          }
        } else {
          let index = this.restrictedRepositories.findIndex(r => r.id === repositoryId);
          if (index !== -1) {
            this.repositories = this.repositories.concat(this.restrictedRepositories[index]);
            this.restrictedRepositories.splice(index, 1);
          }
        }
      }
    });
  }
}
