import { Component, OnInit } from '@angular/core';
import { AboutService } from '../shared/about.service';
import { Version } from '../shared/version.class';

@Component({
  selector: 'app-about-version',
  templateUrl: './about-version.component.html',
  styleUrls: ['./about-version.component.sass']
})
export class AboutVersionComponent implements OnInit {
  version: Version;
  fetchingVersion: boolean;

  constructor(
    public aboutService: AboutService
  ) { }

  ngOnInit() {
    this.version = null;
    this.fetchVersion();
  }

  fetchVersion(): void {
    this.fetchingVersion = true;
    this.aboutService.fetchVersion().subscribe(resp => {
      if (resp && resp.data) {
        const data = resp.data;
        this.version = new Version(data.api_version, data.ui_version, data.git_commit, new Date(data.build_date));
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingVersion = false;
    });
  }
}
