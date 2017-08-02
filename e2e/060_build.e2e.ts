import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, delay } from './utils';
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
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => delay(1000))
      .then((): any => isLoaded())
      .then((): any => browser.getCurrentUrl())
      .then(url => expect(url).toContain('http://localhost:6500/build/'));
  });

  it('should stop job', () => {
    return browser.get('/')
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => delay(3000))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => delay(3000))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('[name="btn-stop"]')).isDisplayed()))
      .then(() => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('[name="btn-stop"]')));
      }))
      .then((): any => element(by.css('[name="btn-stop"]')).click())
      .then(() => delay(3000))
      .then((): any => isLoaded())
      .then(() => element.all(by.css('.red')).count())
      .then(runningBuilds => expect(runningBuilds).toBeGreaterThan(0));
  });

  it('should restart job', () => {
    return browser.get('/')
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => delay(3000))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => delay(3000))
      .then((): any => isLoaded())
      .then((): any => browser.getCurrentUrl())
      .then(url => expect(url).toContain('http://localhost:6500/job/'))
      .then((): any => browser.wait(() => element(by.css('[name="btn-restart"]')).isDisplayed()))
      .then(() => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('[name="btn-restart"]')));
      }))
      .then((): any => element(by.css('[name="btn-restart"]')).click())
      .then(() => delay(2000))
      .then((): any => isLoaded())
      .then(() => element.all(by.css('.yellow')).count())
      .then(runningBuilds => expect(runningBuilds).toBeGreaterThan(0));
  });

  it('should stop last build', () => {
    browser.get('/')
      .then(() => delay(2000))
      .then(() => isLoaded())
      .then(() => element.all(by.css('.is-running')).count())
      .then(runningBuilds => expect(runningBuilds).toBeGreaterThan(0))
      .then((): any => browser.wait(() => element(by.css('.stop-build')).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.stop-build')));
      }))
      .then(() => element.all(by.css('.stop-build')).first().click())
      .then(() => delay(2000))
      .then(() => isLoaded())
      .then(() => element.all(by.css('.is-running')).count())
      .then(runningBuilds => expect(runningBuilds).toBe(0));
  });
});
