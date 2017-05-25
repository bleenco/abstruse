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
  userData: any;
  repositories: string[];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.fetch();
  }

  fetch(): void {
    this.apiService.getRepositories(this.userData.id).subscribe(event => {
      this.repositories = event;
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

  runBuild(e: MouseEvent, repositoryId: number, branch: string): void {
    e.preventDefault();
    e.stopPropagation();

    const data = { repositoryId, branch };
    this.socketService.emit({ type: 'startBuild', data: data });
  }
}
