import { async, inject, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';
import { SocketService } from './socket.service';

describe('Config Service', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule, RouterTestingModule ],
      providers: [ ApiService, SocketService, ConfigService ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service', inject([ConfigService], (service: ConfigService) => {
    expect(service instanceof ConfigService).toBe(true);
  }));

  describe('Config Service', () => {
    let service: ConfigService;

    beforeEach(() => {
      service = new ConfigService();
    });

    it('expect url to be localhost:9876', () => {
      expect(service.url).toBe('http://localhost:9876');
    });
  });
});
