import { browser, by, element, ExpectedConditions } from 'protractor';
import { login, logout, delay } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Job Details', () => {
  before(() => login().then(() => browser.waitForAngularEnabled(false)));
  after(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should restart job watch console log until it matches expected output', () => {
    return browser.get('/job/5')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restart-job')).count().then(cnt => {
          return cnt > 0;
        });
      }))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.restart-job')));
      }))
      .then((): any => element(by.css('.restart-job')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .command')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .command')).count().then(cnt => cnt === 1);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .output')).count().then(cnt => cnt === 1);
      }))
      .then((): any => browser.wait(() => element(by.css(`[name="btn-stop"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-stop"]`)));
      }))
      .then(() => browser.wait(
        ExpectedConditions.presenceOf(element(by.css(`[name="btn-stop"]`)))))
      .then(() => delay(1000))
      .then((): any => element(by.css(`[name="btn-stop"]`)).click());
  });

  it('should restart build and watch job output', () => {
    return browser.get('/build/5')
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element(by.css(`[name="restart-build"]`)).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`[name="restart-build"]`)).isEnabled()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="restart-build"]`)));
      }))
      .then(() => browser.wait(
        ExpectedConditions.presenceOf(element(by.css(`[name="restart-build"]`)))))
      .then(() => delay(1000))
      .then((): any => element(by.css(`[name="restart-build"]`)).click())
      .then((): any => element.all(by.css('.list-item')).count())
      .then(num => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === num;
      })))
      .then(() => browser.get('/job/5'))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .command')).count().then(cnt => cnt === 3);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .output')).count().then(cnt => cnt === 3);
      }))
      .then((): any => browser.wait(() => element(by.css(`[name="btn-stop"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-stop"]`)));
      }))
      .then(() => browser.wait(
        ExpectedConditions.presenceOf(element(by.css(`[name="btn-stop"]`)))))
      .then(() => delay(1000))
      .then((): any => element(by.css(`[name="btn-stop"]`)).click());
  });
});
