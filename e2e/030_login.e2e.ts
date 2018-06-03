import { browser, by, element } from 'protractor';
import { isLoaded } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('User Login', () => {

  it('should not be able to login with wrong credentials', (): any => {
    return browser.get('/login')
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('test@gmail.com'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/login'));
  });

  it('should login with correct username and password', (): any => {
    return browser.get('/login')
      .then(() => browser.waitForAngularEnabled(false))
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => isLoaded())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/'))
      .then(() => browser.waitForAngularEnabled(true));
  });

  it('should be able to logout', (): any => {
    return browser.waitForAngularEnabled(false)
      .then(() => browser.get('/'))
      .then(() => isLoaded())
      .then(() => browser.wait(() => element(by.css('.user-item')).isPresent()))
      .then(() => element(by.css('.user-item')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click())
      .then(() => isLoaded())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/login'))
      .then(() => browser.waitForAngularEnabled(true));
  });
});
