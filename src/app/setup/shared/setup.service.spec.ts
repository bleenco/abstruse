import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SetupService } from './setup.service';

describe('SetupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [SetupService]
    });
  });

  it('should be created', inject([SetupService], (service: SetupService) => {
    expect(service).toBeTruthy();
  }));
});
