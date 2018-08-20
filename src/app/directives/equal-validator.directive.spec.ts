import { async, TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { HttpModule, XHRBackend } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { EqualValidator } from './equal-validator.directive';

describe('Equal validator', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule, RouterTestingModule ],
      providers: [
        EqualValidator,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    })
    .compileComponents();
  }));

  describe('AccessGuard Service', () => {
    let validator: EqualValidator;

    beforeEach(() => {
      validator = new EqualValidator('test');
    });

    it('expect validator to be defined', () => {
      expect(validator).toBeDefined();
    });
  });
});
