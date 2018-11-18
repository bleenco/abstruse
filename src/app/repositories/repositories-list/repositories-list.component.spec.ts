import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesListComponent } from './repositories-list.component';
import { LoaderComponent } from 'src/app/core/loader/loader.component';
import { RepositoriesRepoItemComponent } from '../repositories-repo-item/repositories-repo-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocketService } from 'src/app/shared/providers/socket.service';

describe('RepositoriesListComponent', () => {
  let component: RepositoriesListComponent;
  let fixture: ComponentFixture<RepositoriesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        RepositoriesListComponent,
        LoaderComponent,
        RepositoriesRepoItemComponent
      ],
      providers: [
        SocketService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
