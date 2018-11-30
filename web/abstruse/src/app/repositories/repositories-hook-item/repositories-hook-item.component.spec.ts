import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesHookItemComponent } from './repositories-hook-item.component';

describe('RepositoriesHookItemComponent', () => {
  let component: RepositoriesHookItemComponent;
  let fixture: ComponentFixture<RepositoriesHookItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepositoriesHookItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesHookItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
