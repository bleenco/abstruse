import { async, inject, TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';

describe('Socket Service (mockBackend)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ SocketService ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service', inject([SocketService], (service: SocketService) => {
    expect(service instanceof SocketService).toBe(true);
  }));

  describe('Notification Service', () => {
    let service: SocketService;

    beforeEach(() => {
      service = new SocketService();
    });

    it('expect socket to be defined', () => {
      expect(service.socket).toBeDefined();
    });
  });
});
