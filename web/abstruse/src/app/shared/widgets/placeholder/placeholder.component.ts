import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.sass']
})
export class PlaceholderComponent implements OnInit {
  @Input() background: string;
  @Input() text: string;

  constructor() { }

  ngOnInit() {
  }

}
