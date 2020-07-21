import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BuildsItemsOptions } from '../common/builds-items/builds-items-options.model';
import { filter } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.sass']
})
export class IndexComponent implements OnInit {
  options: BuildsItemsOptions = { type: 'latest' };
  title: string = 'Latest';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    if (!this.route.snapshot.queryParams.type) {
      this.router.navigate(['builds/'], { queryParams: { type: 'latest' } });
    }

    this.route.queryParams
      .pipe(
        filter(params => params.type && params.type !== this.options.type),
        untilDestroyed(this)
      )
      .subscribe(params => {
        this.options = { type: params.type };

        switch (params.type) {
          case 'latest':
            this.title = 'Latest';
            break;
          case 'commits':
            this.title = 'Commits';
            break;
          case 'pull-requests':
            this.title = 'Pull Requests';
            break;
        }
      });
  }
}
