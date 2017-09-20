import { browser, by, element } from 'protractor';
import { isLoaded, delay } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Docker Image', () => {

  it('should login to access images', () => {
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

  it('should build initial docker image with name `abstruse`', () => {
    return browser.get('/images')
      .then(() => browser.waitForAngularEnabled(false))
      .then(() => isLoaded())
      .then(() => delay(5000))
      .then(() => element(by.css('[name="build-image-btn"]')).click())
      .then(() => browser.wait(() => element(by.css('[name="build-done"]')).isPresent()))
      .then(() => browser.waitForAngularEnabled(true));
  });

  it('should logout out of abstruse', () => {
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
