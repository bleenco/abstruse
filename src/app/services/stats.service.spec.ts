import { async, inject, TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { HttpModule, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from './socket.service';
import { StatsService } from './stats.service';

describe('Stats Service', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule, RouterTestingModule ],
      providers: [
        ApiService,
        SocketService,
        StatsService
      ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service', inject([StatsService], (service: StatsService) => {
    expect(service instanceof StatsService).toBe(true);
  }));

  describe('Stats Service', () => {
    let service: StatsService;

    beforeEach(inject([ApiService, SocketService], (api: ApiService, socket: SocketService) => {
      service = new StatsService(socket, api);
    }));

    it('expect stats to be defined', () => {
      expect(service.stats).toBeDefined();
    });
  });
});
