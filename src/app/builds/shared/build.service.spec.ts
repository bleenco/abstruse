import { TestBed, inject } from '@angular/core/testing';

import { BuildService } from './build.service';

describe('BuildService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuildService]
    });
  });

  it('should be created', inject([BuildService], (service: BuildService) => {
    expect(service).toBeTruthy();
  }));
});
