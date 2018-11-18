import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesListComponent } from './images-list.component';
import { LoaderComponent } from 'src/app/core/loader/loader.component';
import { ImageItemComponent } from '../image-item/image-item.component';
import { ImageBaseItemComponent } from '../image-base-item/image-base-item.component';
import { ImageLogDialogComponent } from '../image-log-dialog/image-log-dialog.component';
import { ImageCreateDialogComponent } from '../image-create-dialog/image-create-dialog.component';
import { HumanizeBytesPipe } from 'src/app/shared/pipes/humanize-bytes.pipe';
import { TerminalComponent } from 'src/app/shared/widgets/terminal/terminal.component';
import { FormsModule } from '@angular/forms';
import { SelectboxComponent } from 'src/app/shared/widgets/selectbox/selectbox.component';
import { EditorComponent } from 'src/app/shared/widgets/editor/editor.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocketService } from 'src/app/shared/providers/socket.service';

describe('ImagesListComponent', () => {
  let component: ImagesListComponent;
  let fixture: ComponentFixture<ImagesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule
      ],
      declarations: [
        ImagesListComponent,
        LoaderComponent,
        ImageItemComponent,
        ImageBaseItemComponent,
        ImageLogDialogComponent,
        ImageCreateDialogComponent,
        HumanizeBytesPipe,
        TerminalComponent,
        SelectboxComponent,
        EditorComponent
      ],
      providers: [
        SocketService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
