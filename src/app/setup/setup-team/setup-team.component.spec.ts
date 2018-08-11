import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SetupTeamComponent } from './setup-team.component';
import { SelectboxComponent } from '../../shared/widgets/selectbox/selectbox.component';

describe('SetupTeamComponent', () => {
  let component: SetupTeamComponent;
  let fixture: ComponentFixture<SetupTeamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SetupTeamComponent, SelectboxComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
