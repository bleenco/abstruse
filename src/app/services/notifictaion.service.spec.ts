import { async, inject, TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { SocketService } from './socket.service';

describe('Notification Service (mockBackend)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ NotificationService, SocketService ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service', inject([NotificationService], (service: NotificationService) => {
    expect(service instanceof NotificationService).toBe(true);
  }));

  describe('Notification Service', () => {
    let service: NotificationService;

    beforeEach(inject([ SocketService ], (socket: SocketService) => {
      service = new NotificationService(socket);
    }));

    it('expect notification to be opened', () => {
      expect(service.notifications.isStopped).toBe(false);
      expect(service.notifications.closed).toBe(false);
    });
  });
});
