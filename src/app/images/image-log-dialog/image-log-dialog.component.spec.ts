import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageLogDialogComponent } from './image-log-dialog.component';
import { TerminalComponent } from 'src/app/shared/widgets/terminal/terminal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImageLogDialogComponent', () => {
  let component: ImageLogDialogComponent;
  let fixture: ComponentFixture<ImageLogDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        ImageLogDialogComponent,
        TerminalComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageLogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
