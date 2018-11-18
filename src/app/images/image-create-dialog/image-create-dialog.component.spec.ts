import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCreateDialogComponent } from './image-create-dialog.component';
import { FormsModule } from '@angular/forms';
import { SelectboxComponent } from 'src/app/shared/widgets/selectbox/selectbox.component';
import { EditorComponent } from 'src/app/shared/widgets/editor/editor.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImageCreateDialogComponent', () => {
  let component: ImageCreateDialogComponent;
  let fixture: ComponentFixture<ImageCreateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule
      ],
      declarations: [
        ImageCreateDialogComponent,
        SelectboxComponent,
        EditorComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
