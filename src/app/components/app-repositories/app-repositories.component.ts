import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  repositories: any[];
  dropdowns: boolean[];
  buildTriggered: boolean;
  url: string;
  searchKeyword: string;
  modelChanged: Subject<string> = new Subject<string>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
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
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(event => this.fetch(event));
  }

  fetch(keyword = ''): void {
    this.loading = true;
    const userId = this.userData && this.userData.id || null;
    this.apiService.getRepositories(keyword, userId).subscribe(repositories => {
      this.repositories = repositories;
      this.repositories.forEach((repo: any, i) => {
        this.apiService.getBadge(repo.id).subscribe(badge => {
          if (badge.ok && badge._body && typeof badge._body === 'string') {
            this.repositories[i].status_badge = badge._body.replace(/url\(/g, 'url(' + document.location.href);
          }
        });
      });

      this.loading = false;
    });
  }

  gotoRepository(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.router.navigate(['repo', id], { queryParams: { tab: 'builds' } });
  }

  onKeywordChanged(text: string): void {
    this.modelChanged.next(text);
  }
}
