import { Component, OnInit } from '@angular/core';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Repo } from '../shared/repo.model';

@Component({
  selector: 'app-repos-settings-modal',
  templateUrl: './repos-settings-modal.component.html',
  styleUrls: ['./repos-settings-modal.component.sass']
})
export class ReposSettingsModalComponent implements OnInit {
  repo: Repo;

  constructor(public activeModal: ActiveModal) {}

  ngOnInit(): void {}
}
