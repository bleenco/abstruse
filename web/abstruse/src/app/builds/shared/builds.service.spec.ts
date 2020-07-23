import { TestBed } from '@angular/core/testing';

import { BuildsService } from './builds.service';

describe('BuildsService', () => {
  let service: BuildsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
