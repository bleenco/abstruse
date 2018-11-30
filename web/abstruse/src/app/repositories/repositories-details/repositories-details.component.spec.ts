import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesDetailsComponent } from './repositories-details.component';

describe('RepositoriesDetailsComponent', () => {
  let component: RepositoriesDetailsComponent;
  let fixture: ComponentFixture<RepositoriesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepositoriesDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
