import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesRepoItemComponent } from './repositories-repo-item.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocketService } from 'src/app/shared/providers/socket.service';

describe('RepositoriesRepoItemComponent', () => {
  let component: RepositoriesRepoItemComponent;
  let fixture: ComponentFixture<RepositoriesRepoItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        RepositoriesRepoItemComponent
      ],
      providers: [
        SocketService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesRepoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
