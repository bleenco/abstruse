import { browser, by, element } from 'protractor';
import { delay } from './utils';

describe('User Login', () => {

  beforeEach(() => {
    browser.get('/');
  });

  it('shoud not be able to login with wrong credentials', () => {
    browser.get('/login')
      .then(() => delay(1000))
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('test@gmail.com'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/login'));
  });

  it('should login with correct username and password', () => {
    browser.get('/login')
      .then(() => delay(1000))
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => delay(1000))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/'));
  });

});
