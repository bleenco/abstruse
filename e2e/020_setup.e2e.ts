import { browser, by, element } from 'protractor';
import { isLoaded } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('User Registration', () => {
  it(`continue button should be disabled when password is empty`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('John Wayne'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.button[name="btn-register"]')).isEnabled())
      .then(enabled => expect(enabled).to.equal(false))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/setup'));
  });

  it(`continue button should be disabled when email is not email address`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('johngmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('John Wayne'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="password2"]')).sendKeys('test123'))
      .then(() => element(by.css('.button[name="btn-register"]')).isEnabled())
      .then(enabled => expect(enabled).to.equal(false))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/setup'));
  });

  it(`continue button should be disabled when name is empty`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys(''))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="password2"]')).sendKeys('test123'))
      .then(() => element(by.css('.button[name="btn-register"]')).isEnabled())
      .then(enabled => expect(enabled).to.equal(false))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/setup'));
  });

  it(`continue button should be disabled when passwords don't match`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('John Wayne'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="password2"]')).sendKeys('test12'))
      .then(() => element(by.css('.button[name="btn-register"]')).isEnabled())
      .then(enabled => expect(enabled).to.equal(false))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/setup'));
  });

  it('should successfully register user', () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('John Wayne'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="password2"]')).sendKeys('test123'))
      .then(() => element(by.css('.button[name="btn-register"]')).click())
      .then(() => {
        return Promise.resolve()
          .then((): any => browser.wait(() => element(by.css('[name="loginPage"]')).isPresent()))
          .then((): any => element(by.css('[name="loginPage"]')).click())
          .then((): any => browser.getCurrentUrl())
          .then(url => expect(url).to.equal('http://localhost:6500/login'));
      });
  });

});
