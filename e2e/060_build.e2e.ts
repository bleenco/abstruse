import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, waitForUrlToChangeTo, delay } from './utils';
import { request, header } from '../tests/e2e/webhooks/github/PushEvent';
import { sendGitHubRequest } from '../tests/e2e/utils/utils';

describe('Build', () => {

  beforeAll(() => {
    login()
      .then(() => browser.waitForAngularEnabled(false));
  });

  afterAll(() => {
    logout()
      .then(() => browser.waitForAngularEnabled(true));
  });

  it('should start new build (send open_pull_request event)', () => {
    return sendGitHubRequest(request, header)
      .then(() => browser.get('/'))
      .then(() => delay(3000))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.list-item'))), 10000);
      })
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/'));
  });

  it('should stop job', () => {
    return browser.get('/')
      .then(() => delay(3000))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => waitForUrlToChangeTo('http://localhost:6500/build/'))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => waitForUrlToChangeTo('http://localhost:6500/job/'))
      .then((): any => browser.wait(() => element(by.css('[name="btn-stop"]')).isDisplayed()))
      .then((): any => element(by.css('[name="btn-stop"]')).click())
      .then(() => browser.wait(() => {
        return element.all(by.css('.yellow')).count()
          .then(count => count === 0);
      }));
  });

  it('should restart job', () => {
    return browser.get('/')
      .then(() => delay(3000))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.list-item'))), 10000);
      })
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => waitForUrlToChangeTo('http://localhost:6500/build/'))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => waitForUrlToChangeTo('http://localhost:6500/job/'))
      .then((): any => browser.wait(() => element(by.css('[name="btn-restart"]')).isDisplayed()))
      .then((): any => element(by.css('[name="btn-restart"]')).click())
      .then(() => browser.wait(() => {
        return element.all(by.css('.yellow')).count()
          .then(count => count > 0);
      }));
  });

  it('should stop last build', () => {
    browser.get('/')
      .then(() => delay(3000))
      .then((): any => browser.wait(() => element(by.css('.stop-build')).isPresent()))
      .then(() => element.all(by.css('.stop-build')).first().click())
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });
});
