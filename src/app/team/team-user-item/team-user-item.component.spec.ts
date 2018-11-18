import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamUserItemComponent } from './team-user-item.component';
import { SelectboxComponent } from 'src/app/shared/widgets/selectbox/selectbox.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TeamUserItemComponent', () => {
  let component: TeamUserItemComponent;
  let fixture: ComponentFixture<TeamUserItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule
      ],
      declarations: [
        TeamUserItemComponent,
        SelectboxComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamUserItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
