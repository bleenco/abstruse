import { TestBed, inject } from '@angular/core/testing';

import { DataService } from './data.service';
import { SocketService } from './socket.service';

describe('DataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataService, SocketService]
    });
  });

  it('should be created', inject([DataService], (service: DataService) => {
    expect(service).toBeTruthy();
  }));
});
