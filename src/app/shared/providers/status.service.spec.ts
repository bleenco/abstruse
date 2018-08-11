import { TestBed, inject } from '@angular/core/testing';

import { StatusService } from './status.service';

describe('StatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatusService]
    });
  });

  it('should be created', inject([StatusService], (service: StatusService) => {
    expect(service).toBeTruthy();
  }));
});
