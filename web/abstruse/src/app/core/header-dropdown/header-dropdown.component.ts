import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/providers/auth.service';

@Component({
  selector: 'app-header-dropdown',
  templateUrl: './header-dropdown.component.html',
  styleUrls: ['./header-dropdown.component.sass']
})
export class HeaderDropdownComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit() { }

}
