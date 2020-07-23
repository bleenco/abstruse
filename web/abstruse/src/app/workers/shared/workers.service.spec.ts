import { TestBed } from '@angular/core/testing';

import { WorkersService } from './workers.service';

describe('WorkersService', () => {
  let service: WorkersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
