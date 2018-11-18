import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageItemComponent } from './image-item.component';
import { HumanizeBytesPipe } from 'src/app/shared/pipes/humanize-bytes.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImageItemComponent', () => {
  let component: ImageItemComponent;
  let fixture: ComponentFixture<ImageItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        ImageItemComponent,
        HumanizeBytesPipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
