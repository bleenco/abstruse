import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UploadInput, UploadOutput } from 'ngx-uploader';
import { delay, switchMap } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

export interface IAccessToken {
  token: string;
  description: string;
  gitlab_username: string;
  bitbucket_client_id: string;
  bitbucket_oauth_key: string;
  bitbucket_oauth_secret: string;
  type: 'github' | 'gitlab' | 'bitbucket' | 'gogs';
  users_id: number;
}

@Component({
  selector: 'app-user',
  templateUrl: 'app-user.component.html'
})
export class AppUserComponent implements OnInit {
  loading: boolean;
  tab: string;
  user: any;
  loggedUser: any;
  avatarUrl: string;
  repositories: any;
  restrictedRepositories: any;
  password: string;
  saving: boolean;
  userSaved: boolean;
  yesNoOptions: { key: number, value: string }[];
  savingPassword: boolean;
  passwordSaved: boolean;
  token: IAccessToken;
  tokenTypeOptions: { key: any, value: string }[];
  uploading: boolean;
  uploadProgress: number;
  uploadInput: EventEmitter<UploadInput>;

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
    this.uploading = false;
    this.uploadProgress = 0;
    this.uploadInput = new EventEmitter<UploadInput>();
  }

  ngOnInit() {
    this.tab = 'profile';
    this.loggedUser = this.auth.getData();
    this.token = {
      token: '',
      description: '',
      gitlab_username: '',
      bitbucket_client_id: '',
      bitbucket_oauth_key: '',
      bitbucket_oauth_secret: '',
      type: 'github',
      users_id: this.route.snapshot.params.id
    };

    this.tokenTypeOptions = [
      { key: 'github', value: 'GitHub' },
      { key: 'gitlab', value: 'GitLab' },
      { key: 'bitbucket', value: 'BitBucket' },
      { key: 'gogs', value: 'Gogs' }
    ];

    this.fetchUser();
  }

  fetchUser(): void {
    this.route.params
      .pipe(
        switchMap((params: Params) => this.api.getUser(params.id))
      )
      .subscribe((user: any) => {
        if (user) {
          this.user = user;
        }

        this.avatarUrl = this.config.url + user.avatar;
        this.loading = false;
      });

    this.route.params
      .pipe(
        switchMap(() => this.api.getRepositories('', this.loggedUser.id))
      )
      .subscribe(((repositories: any) => {
        this.repositories = repositories;
        this.repositories.forEach((repo: any, i) => {
          this.api.getBadge(repo.id).subscribe(badge => {
            if (badge.ok) {
              this.repositories[i].status_badge = badge._body;
            }
          });
        });

        this.api.getRepositories('', this.user.id).subscribe(userRepositories => {
          this.restrictedRepositories =
            repositories.filter(r => userRepositories.findIndex(ur => ur.id === r.id) === -1);

          this.restrictedRepositories.forEach((repo: any, i) => {
            this.api.getBadge(repo.id).subscribe(badge => {
              if (badge.ok) {
                this.restrictedRepositories[i].status_badge = badge._body;
              }
            });
          });
          this.repositories = this.repositories.filter(r => {
            return this.restrictedRepositories.findIndex(rr => rr.id === r.id) === -1;
          });
        });
      }));
  }

  updateUser(e: Event): void {
    e.preventDefault();

    this.userSaved = null;
    this.saving = true;
    this.user.id = this.route.snapshot.params.id;
    delete this.user.permissions;
    delete this.user.access_tokens;
    this.api.updateUser(this.user)
      .pipe(delay(300))
      .subscribe(event => {
        if (event) {
          this.userSaved = true;
        }
        this.saving = false;

        this.fetchUser();
      });
  }

  updatePassword(): void {
    const form = {
      id: this.route.snapshot.params.id,
      password: this.password,
      repeat_password: this.password
    };

    this.passwordSaved = null;
    this.savingPassword = true;
    this.api.updatePassword(form)
      .pipe(delay(500))
      .subscribe(event => {
        if (event) {
          this.passwordSaved = true;
        }

        this.password = null;
        this.savingPassword = false;
      });
  }

  addToken(e: MouseEvent): void {
    e.preventDefault();

    this.token.users_id = this.route.snapshot.params.id;
    this.api.addToken(this.token).subscribe(event => {
      if (event) {
        this.token.description = '';
        this.token.token = '';
        this.token.gitlab_username = '';
        this.token.bitbucket_client_id = '';
        this.token.bitbucket_oauth_key = '';
        this.token.bitbucket_oauth_secret = '';
        this.token.type = 'github';
        this.fetchUser();
      }
    });
  }

  removeToken(id: number): void {
    this.api.removeToken(id).subscribe(event => {
      if (event) {
        this.fetchUser();
      }
    });
  }

  changeTokenTypeSelect(): void {
    this.token.description = '';
    this.token.token = '';
    this.token.gitlab_username = '';
    this.token.bitbucket_client_id = '';
    this.token.bitbucket_oauth_key = '';
    this.token.bitbucket_oauth_secret = '';
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

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      const event: UploadInput = {
        type: 'uploadAll',
        url: this.config.url + '/api/user/upload-avatar',
        method: 'POST',
        data: { userId: this.user.id.toString() }
      };

      this.uploadInput.emit(event);
      this.uploading = true;
      this.uploadProgress = 0;
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      this.uploadProgress = output.file.progress.data.percentage;
      if (this.uploadProgress === 100) {
        this.uploading = false;
        this.uploadProgress = 0;
      }
    } else if (output.file && output.file.responseStatus === 200) {
      const jwt = output.file.response.data;
      this.auth.login(jwt);
      this.loggedUser = this.auth.getData();
      this.fetchUser();
    }
  }
}
