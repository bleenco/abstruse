import { TestBed } from '@angular/core/testing';

import { WorkersService } from './workers.service';

describe('WorkersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkersService = TestBed.get(WorkersService);
    expect(service).toBeTruthy();
  });
});
