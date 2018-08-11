import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/providers/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit() {
  }

}
