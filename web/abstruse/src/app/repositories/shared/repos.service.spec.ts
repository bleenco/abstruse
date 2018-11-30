import { TestBed } from '@angular/core/testing';

import { ReposService } from './repos.service';

describe('ReposService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReposService = TestBed.get(ReposService);
    expect(service).toBeTruthy();
  });
});
