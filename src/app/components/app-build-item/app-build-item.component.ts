import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-build-item',
  templateUrl: 'app-build-item.component.html',
})
export class AppBuildItemComponent {
  @Input() build: any;
  @HostBinding('class') classes = 'column is-12';
}
