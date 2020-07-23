import { TestBed } from '@angular/core/testing';

import { SetupService } from './setup.service';

describe('SetupService', () => {
  let service: SetupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
