import { TestBed } from '@angular/core/testing';

import { IntegrationService } from './integration.service';

describe('IntegrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntegrationService = TestBed.get(IntegrationService);
    expect(service).toBeTruthy();
  });
});
