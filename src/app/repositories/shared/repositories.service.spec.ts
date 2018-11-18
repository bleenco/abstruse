import { TestBed, inject } from '@angular/core/testing';

import { RepositoriesService } from './repositories.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocketService } from 'src/app/shared/providers/socket.service';

describe('RepositoriesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        RepositoriesService,
        SocketService
      ]
    });
  });

  it('should be created', inject([RepositoriesService], (service: RepositoriesService) => {
    expect(service).toBeTruthy();
  }));
});
