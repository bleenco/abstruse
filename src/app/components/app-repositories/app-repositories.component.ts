import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import 'rxjs/add/operator/distinct';

export interface Repository {
  url: string;
}

@Component({
  selector: 'app-repositories',
  templateUrl: 'app-repositories.component.html'
})
export class AppRepositoriesComponent implements OnInit {
  repository: Repository;
  userData: Object;
  repositories: string[];
  repositoriesDropdowns: boolean[];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.fetch();

    this.socketService.onMessage().distinct(x => x.data.status).subscribe(event => {
      if (event.type === 'terminalOutput') {
        console.log(event.data);

      } else if (event.type === 'terminalExit') {
        if (event.data === 0) {

        }
      }
    });

    this.socketService.emit({ type: 'data', data: 'getAllRunningBuilds' });
  }

  fetch(): void {
    this.apiService.getRepositories('1').subscribe(event => {
      this.repositories = event;
      this.repositoriesDropdowns = this.repositories.map(repo => false);
    });
  }

  addRepositoryForm(): void {
    this.repository = { url: '' };
  }

  addRepository(): void {
    this.apiService.addRepository(this.repository).subscribe(event => {
      if (event) {
        this.repository = null;
        this.fetch();
      }
    });
  }

  toggleDropdown(index: number): void {
    this.repositoriesDropdowns = this.repositoriesDropdowns.map((repo, i) => {
      if (i !== index) {
        return false;
      } else {
        return !repo;
      }
    });
  }

  runBuild(repositoryId: number): void {
    this.socketService.emit({ type: 'startBuild', data: repositoryId });
  }
}
