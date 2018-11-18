import { TestBed, inject } from '@angular/core/testing';

import { ImageService } from './image.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ImageService
      ]
    });
  });

  it('should be created', inject([ImageService], (service: ImageService) => {
    expect(service).toBeTruthy();
  }));
});
