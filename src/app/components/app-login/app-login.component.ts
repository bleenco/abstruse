import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: 'app-login.component.html'
})
export class AppLoginComponent implements OnInit {
  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.isAppReady().subscribe(event => {
      if (!event) {
        this.router.navigate(['/setup']);
      }
    });
  }
}
