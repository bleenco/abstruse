import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';

export interface Repository {
  url: string;
}

@Component({
  selector: 'app-repositories',
  templateUrl: 'app-repositories.component.html'
})
export class AppRepositoriesComponent implements OnInit {
  loading: boolean;
  repository: Repository;
  userData: any;
  repositories: string[];
  dropdowns: boolean[];
  buildTriggered: boolean;
  url: string;
  searchKeyword: string;
  modelChanged: Subject<string> = new Subject<string>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router,
    private config: ConfigService
  ) {
    this.loading = true;
  }

  ngOnInit() {
    this.url = this.config.url;
    this.userData = this.authService.getData();
    this.fetch();

    this.modelChanged
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(event => this.fetch(event));
  }

  fetch(keyword = ''): void {
    this.loading = true;
    this.apiService.getRepositories(this.userData.id, keyword).subscribe(event => {
      this.repositories = event.map(repo => {
        repo.status_badge = this.url + '/api/repositories/badge/' + repo.id;
        return repo;
      });
      this.loading = false;
    });
  }

  gotoRepository(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.router.navigate(['repo', id]);
  }

  runBuild(e: MouseEvent, repositoryId: number, branch: string): void {
    e.preventDefault();
    e.stopPropagation();

    const data = { repositoryId, branch };
    this.socketService.emit({ type: 'startBuild', data: data });
    this.dropdowns = this.dropdowns.map(() => false);

    this.buildTriggered = true;
    setTimeout(() => this.buildTriggered = false, 5000);
  }

  onKeywordChanged(text: string): void {
    this.modelChanged.next(text);
  }
}
