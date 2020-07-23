import { Component, OnInit, Input } from '@angular/core';
import { Build } from '../../shared/build.model';
import { BuildsService } from '../../shared/builds.service';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-build-list-item',
  templateUrl: './build-list-item.component.html',
  styleUrls: ['./build-list-item.component.sass']
})
export class BuildListItemComponent implements OnInit {
  @Input() build!: Build;
  @Input() style: 'repo' | 'history' = 'history';

  constructor(private buildsService: BuildsService) {}

  ngOnInit(): void {}

  restartBuild(): void {
    this.build.processing = true;
    this.buildsService
      .restartBuild(this.build.id)
      .pipe(
        finalize(() => (this.build.processing = false)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  stopBuild(): void {
    this.build.processing = true;
    this.buildsService
      .stopBuild(this.build.id)
      .pipe(
        finalize(() => (this.build.processing = false)),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
