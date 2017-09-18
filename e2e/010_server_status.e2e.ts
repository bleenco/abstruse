import { browser, by, element } from 'protractor';
import { isLoaded } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Server Status', () => {

  it(`should have docker installed`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="docker-installed-icon"]')))
      .then(el => el.getAttribute('src'))
      .then(attr => expect(attr).to.includes('images/icons/check-true.svg'));
  });

  it(`should have docker running`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="docker-running-icon"]')))
      .then(el => el.getAttribute('src'))
      .then(attr => expect(attr).to.includes('/images/icons/check-true.svg'));
  });

  it(`should have sqlite3 installed`, () => {
    return browser.get('/setup')
      .then(() => isLoaded())
      .then(() => element(by.css('[name="sqlite3-installed-icon"]')))
      .then(el => el.getAttribute('src'))
      .then(attr => expect(attr).to.includes('images/icons/check-true.svg'));
  });
});
