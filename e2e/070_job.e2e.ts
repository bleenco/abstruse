import { browser, by, element, ExpectedConditions } from 'protractor';
import { login, logout, delay } from './utils';


describe('Job Details', () => {
  let originalTimeout: number;
  beforeAll(() => login().then(() => browser.waitForAngularEnabled(false)));
  afterAll(() => logout().then(() => browser.waitForAngularEnabled(true)));

  xit('should restart job watch console log until it matches expected output', () => {
    return browser.get('/job/5')
      .then((): any => browser.wait(() => element(by.css(`[name="btn-restart"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-restart"]`)));
      }))
      .then(() => browser.wait(
        ExpectedConditions.presenceOf(element(by.css(`[name="btn-restart"]`)))))
      .then(() => delay(1000))
      .then((): any => element(by.css(`[name="btn-restart"]`)).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .command')).count().then(cnt => {
          return cnt === 2;
        });
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .output.is-hidden')).count().then(cnt => {
          return cnt === 2;
        });
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

  xit('should restart build and watch job output', () => {
    return browser.get('/build/4')
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element(by.css(`[name="restart-build"]`)).isPresent()))
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
        return element.all(by.css('.terminal .command')).count().then(cnt => {
          return cnt === 3;
        });
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .output.is-hidden')).count().then(cnt => {
          return cnt === 3;
        });
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
