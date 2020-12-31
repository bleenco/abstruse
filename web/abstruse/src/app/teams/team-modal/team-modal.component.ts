import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Team, User } from '../shared/user.model';
import { TeamsService } from '../shared/teams.service';
import { UsersService } from '../shared/users.service';
import { ReposService } from 'src/app/repos/shared/repos.service';
import { Repo } from 'src/app/repos/shared/repo.model';

@UntilDestroy()
@Component({
  selector: 'app-team-modal',
  templateUrl: './team-modal.component.html',
  styleUrls: ['./team-modal.component.sass']
})
export class TeamModalComponent implements OnInit {
  team!: Team;
  saving = false;
  error: string | null = null;
  form!: FormGroup;
  tab: 'general' | 'members' | 'access' = 'general';
  users: User[] = [];
  fetchingUsers = false;
  fetchingUsersError: string | null = null;
  repos: Repo[] = [];
  fetchingRepos = false;
  fetchingReposError: string | null = null;

  get displayedUsers(): User[] {
    return this.users && this.team && this.team.users
      ? this.users.filter(u => !this.team.users || !this.team.users.find(j => j.id === u.id))
      : this.users;
  }

  get displayedRepos(): Repo[] {
    return this.repos && this.team && this.team.repos
      ? this.repos.filter(r => !this.team.repos || !this.team.repos.find(j => j.repoID === r.id))
      : this.repos;
  }

  constructor(
    private fb: FormBuilder,
    private teamsService: TeamsService,
    private usersService: UsersService,
    private reposService: ReposService,
    public activeModal: ActiveModal
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.listUsers();
    this.listRepos();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.error = null;
    this.saving = true;
    let data: any = {
      name: this.form.controls.name.value,
      about: this.form.controls.about.value,
      color: this.form.controls.color.value,
      members:
        this.team && this.team.users && this.team.users.length
          ? this.team.users.map(u => u.id)
          : [],
      repos:
        this.team && this.team.repos && this.team.repos.length
          ? this.team.repos.map(r => ({ id: r.repoID, read: r.read, write: r.write, exec: r.exec }))
          : []
    };
    if (this.team && this.team.id) {
      data = { ...data, ...{ id: this.team.id } };
    }

    if (data.id) {
      this.teamsService
        .update(data)
        .pipe(
          finalize(() => (this.saving = false)),
          untilDestroyed(this)
        )
        .subscribe(
          () => {
            this.activeModal.close(true);
          },
          err => {
            this.error = err.message;
          }
        );
    } else {
      this.teamsService
        .create(data)
        .pipe(
          finalize(() => (this.saving = false)),
          untilDestroyed(this)
        )
        .subscribe(
          () => {
            this.activeModal.close(true);
          },
          err => {
            this.error = err.message;
          }
        );
    }
  }

  listUsers(): void {
    this.fetchingUsers = true;
    this.usersService
      .list()
      .pipe(
        finalize(() => (this.fetchingUsers = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.users = resp;
        },
        err => {
          this.fetchingUsersError = err.message;
        }
      );
  }

  addUser(id: number | undefined): void {
    if (!id) {
      return;
    }
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return;
    }
    if (!this.team) {
      this.team = new Team();
    }
    if (!this.team.users) {
      this.team.users = [];
    }
    this.team.users.push(user);
  }

  removeUser(id: number): void {
    if (!this.team || !this.team.users) {
      return;
    }
    this.team.users = this.team.users.filter(u => u.id !== id);
  }

  listRepos(): void {
    this.fetchingRepos = true;
    this.reposService
      .find(0, 0)
      .pipe(
        finalize(() => (this.fetchingRepos = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => (this.repos = resp.data),
        err => (this.fetchingReposError = err.message)
      );
  }

  addRepo(id: number | undefined): void {
    if (!id) {
      return;
    }
    const repo = this.repos.find(r => r.id === id);
    if (!repo) {
      return;
    }
    if (!this.team) {
      this.team = new Team();
    }
    if (!this.team.repos) {
      this.team.repos = [];
    }
    this.team.repos.push({
      repoID: repo.id as number,
      repoFullName: repo.fullName as string,
      read: true,
      write: true,
      exec: true
    });
  }

  removeRepo(id: number): void {
    if (!this.team || !this.team.repos) {
      return;
    }
    this.team.repos = this.team.repos.filter(r => r.repoID !== id);
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [(this.team && this.team.id) || null, []],
      name: [(this.team && this.team.name) || null, [Validators.required]],
      about: [(this.team && this.team.about) || null, [Validators.required]],
      color: [(this.team && this.team.color) || null, [Validators.required]]
    });
  }
}
