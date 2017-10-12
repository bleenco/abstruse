import { inject, TestBed } from '@angular/core/testing';
import { EventManager } from '@angular/platform-browser';
import { WindowService } from './window.service';

describe('Window Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ WindowService ]
    })
    .compileComponents();
  });

  it('can instantiate service when inject service', inject([WindowService], (service: WindowService) => {
    expect(service instanceof WindowService).toBe(true);
  }));

  describe('Time Service', () => {
    let service: WindowService;

    beforeEach(inject([EventManager], (manager: EventManager) => {
      service = new WindowService(manager);
    }));

    it('expect timer to be defined', () => {
      expect(service.resize).toBeDefined();
    });
  });
});
