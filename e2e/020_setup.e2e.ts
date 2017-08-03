import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded } from './utils';

describe('User Registration', () => {
  let originalTimeout = 300000;
  beforeAll(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1200000;
  });

  afterAll(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout);

  it(`continue button should be disabled when password is empty`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('John Wayne'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.button[name="btn-register"]')).isEnabled())
      .then(enabled => expect(enabled).toEqual(false))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/setup'));
  });

  it(`continue button should be disabled when email is not email address`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('johngmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('John Wayne'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="password2"]')).sendKeys('test123'))
      .then(() => element(by.css('.button[name="btn-register"]')).isEnabled())
      .then(enabled => expect(enabled).toEqual(false))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/setup'));
  });

  it(`continue button should be disabled when name is empty`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys(''))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="password2"]')).sendKeys('test123'))
      .then(() => element(by.css('.button[name="btn-register"]')).isEnabled())
      .then(enabled => expect(enabled).toEqual(false))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/setup'));
  });

  it(`continue button should be disabled when passwords don't match`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('John Wayne'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="password2"]')).sendKeys('test12'))
      .then(() => element(by.css('.button[name="btn-register"]')).isEnabled())
      .then(enabled => expect(enabled).toEqual(false))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/setup'));
  });

  it('should successfully register user and build docker image', () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="btn-continue"]')).click())
      .then(() => isLoaded())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('John Wayne'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="password2"]')).sendKeys('test123'))
      .then(() => element(by.css('.button[name="btn-register"]')).click())
      .then(() => isLoaded())
      .then(() => browser.getCurrentUrl())
      .then((url): any => {
        if (url === 'http://localhost:6500/setup') {
          return Promise.resolve()
            .then((): any => browser.wait(() => element(by.css('[name="loginPage"]')).isPresent()))
            .then((): any => element(by.css('[name="loginPage"]')).click())
            .then((): any => browser.getCurrentUrl())
            .then(url => expect(url).toEqual('http://localhost:6500/login'));
        } else {
          return Promise.resolve();
        }
      });
  });

});
