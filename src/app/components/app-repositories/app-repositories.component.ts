import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-repositories',
  templateUrl: 'app-repositories.component.html'
})
export class AppRepositoriesComponent implements OnInit {
  userData: Object;
  repositories: string[];

  constructor(private apiService: ApiService, private authService: AuthService) { }

  ngOnInit() {
    this.userData = this.authService.getData();
    console.log(this.userData);
  }
}
