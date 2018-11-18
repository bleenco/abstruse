import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesRepoDetailsComponent } from './repositories-repo-details.component';
import { SvgIconComponent, SvgIconRegistryService } from 'angular-svg-icon';
import { BuildItemComponent } from 'src/app/builds/build-item/build-item.component';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from 'src/app/core/loader/loader.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SelectboxComponent } from 'src/app/shared/widgets/selectbox/selectbox.component';
import { ToTimePipe } from 'src/app/shared/pipes/to-time.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocketService } from 'src/app/shared/providers/socket.service';

describe('RepositoriesRepoDetailsComponent', () => {
  let component: RepositoriesRepoDetailsComponent;
  let fixture: ComponentFixture<RepositoriesRepoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        RepositoriesRepoDetailsComponent,
        SvgIconComponent,
        BuildItemComponent,
        LoaderComponent,
        SelectboxComponent,
        ToTimePipe
      ],
      providers: [
        SocketService,
        SvgIconRegistryService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesRepoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
