import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-team',
  templateUrl: 'app-team.component.html'
})
export class AppTeamComponent implements OnInit {
  loading: boolean;
  users: any[];

  constructor(private api: ApiService, private auth: AuthService) {
    this.loading = true;
    this.users = [];
  }

  ngOnInit() {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.api.getUsers().subscribe(event => {
      this.users = event;
      this.loading = false;
    });
  }
}
