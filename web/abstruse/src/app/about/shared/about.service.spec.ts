import { TestBed } from '@angular/core/testing';

import { AboutService } from './about.service';

describe('AboutService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AboutService = TestBed.get(AboutService);
    expect(service).toBeTruthy();
  });
});
