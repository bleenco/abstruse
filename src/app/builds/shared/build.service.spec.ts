import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BuildService } from './build.service';
import { SocketService } from '../../shared/providers/socket.service';

describe('BuildService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BuildService, SocketService]
    });
  });

  it('should be created', inject([BuildService], (service: BuildService) => {
    expect(service).toBeTruthy();
  }));
});
