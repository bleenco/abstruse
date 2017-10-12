import { inject, TestBed } from '@angular/core/testing';
import { TimeService } from './time.service';

describe('Time Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ TimeService ]
    })
    .compileComponents();
  });

  it('can instantiate service when inject service', inject([TimeService], (service: TimeService) => {
    expect(service instanceof TimeService).toBe(true);
  }));

  describe('Time Service', () => {
    let service: TimeService;

    beforeEach(() => {
      service = new TimeService();
    });

    it('expect timer to be defined', () => {
      expect(service.timer).toBeDefined();
    });
  });
});
