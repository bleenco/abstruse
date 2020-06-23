import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/providers/auth.service';
import { SettingsService } from 'src/app/shared/providers/settings.service';

@Component({
  selector: 'app-header-dropdown',
  templateUrl: './header-dropdown.component.html',
  styleUrls: ['./header-dropdown.component.sass']
})
export class HeaderDropdownComponent implements OnInit {
  constructor(public authService: AuthService, public settings: SettingsService) {}

  ngOnInit() {}
}
