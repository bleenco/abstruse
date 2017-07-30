import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';

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
  }

  fetch(): void {
    this.apiService.getRepositories(this.userData.id).subscribe(event => {
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
}
