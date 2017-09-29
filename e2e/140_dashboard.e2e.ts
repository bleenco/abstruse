import { browser, by, element, ExpectedConditions } from 'protractor';
import { login, logout, isLoaded } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('Dashboard', () => {
  before(() => login().then(() => browser.waitForAngularEnabled(false)));
  after(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should go to dashboard and see that no container is running', () => {
    return  browser.get('/dashboard')
      .then((): any => browser.wait(() => element(by.css('.p-content')).isPresent()))
      .then(() => element(by.css('.p-content')).getText())
      .then(txt => expect(txt).to.equals('No available data or no jobs running.'));
  });

  it('should go to dashboard and wait for cpu graph', () => {
    return  browser.get('/dashboard')
      .then(() => isLoaded())
      .then(() => element.all(by.css('.progress-chart')).count())
      .then(cnt => expect(cnt).to.equals(0))
      .then((): any => browser.wait(() => element(by.css('.progress-chart')).isPresent()));
  });

  it('should go to dashboard and see jobs in last 7 days', () => {
    return  browser.get('/dashboard')
      .then(() => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.line-chart-top-content')).isPresent()))
      .then(() => element.all(by.css('.line-chart-top-content')).count())
      .then(cnt => expect(cnt).to.equals(1));
  });

  it('should go to dashboard and see memory widget', () => {
    return  browser.get('/dashboard')
    .then(() => isLoaded())
    .then((): any => browser.wait(() => element(by.css('[name="memory-usage"]')).isPresent()))
    .then(() => element(by.css('[name="memory-usage"]')).getCssValue('width'))
    .then(width => expect(width).to.not.equals('0px'));
  });
});
