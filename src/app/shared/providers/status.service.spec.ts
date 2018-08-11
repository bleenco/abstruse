import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { StatusService } from './status.service';

describe('StatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StatusService]
    });
  });

  it('should be created', inject([StatusService], (service: StatusService) => {
    expect(service).toBeTruthy();
  }));
});
