import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, waitForUrlToChangeTo, delay } from './utils';
import { request as pushEventRequest, header as pushEventHeader }
  from '../tests/e2e/webhooks/github/PushEvent';
import { requestOpened, requestReopened, header as pullRequestHeader }
  from '../tests/e2e/webhooks/github/PullRequestEvent';
import { sendGitHubRequest } from '../tests/e2e/utils/utils';

describe('Builds', () => {

  beforeAll(() => {
    login()
      .then(() => browser.waitForAngularEnabled(false));
  });

  afterAll(() => {
    logout()
      .then(() => browser.waitForAngularEnabled(true));
  });


  it('should open first page with zero builds', () => {
    return browser.get('/')
      .then(() => browser.wait(() => element(by.css('.is-info')).isPresent()))
      .then(() => expect(element(by.css('.is-info')).getText())
        .toContain('No builds has been runned yet.'));
  });

  it('should start new build (send push event)', () => {
    return sendGitHubRequest(pushEventRequest, pushEventHeader)
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()));
  });

  it('should redirect after click on first build', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.list-item'))), 10000);
      })
      .then((): any => element(by.css('.list-item')).click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/1'))
      .then(() => browser.get('/'))
      .then((): any => browser.wait(() => element(by.css('.stop-build')).isPresent()))
      .then((): any => element(by.css('.stop-build')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => count === 0);
      }));
  });

  it('should start new build (send open_pull_request event)', () => {
    return sendGitHubRequest(requestOpened, pullRequestHeader)
      .then((): any => browser.wait(() => element(by.css('.list-item:nth-child(1)')).isPresent()))
      .then((): any => element.all(by.css('.list-item:nth-child(1)')).click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/2'))
      .then(() => browser.get('/'))
      .then((): any => browser.wait(() => element(by.css('.stop-build')).isPresent()))
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => {
            if (count === 0) {
              return true;
            } else {
              return false;
            }
          });
      }));
  });

  it('should start new build (send reopen_pull_request event)', () => {
    return sendGitHubRequest(requestReopened, pullRequestHeader)
      .then((): any => browser.wait(() => element(by.css('.list-item:nth-child(1)')).isPresent()))
      .then((): any => element.all(by.css('.list-item:nth-child(1)')).click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/3'))
      .then(() => browser.get('/'))
      .then((): any => browser.wait(() => element(by.css('.stop-build')).isPresent()))
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => {
            if (count === 0) {
              return true;
            } else {
              return false;
            }
          });
      }));
  });

  it('should restart last build', () => {
    browser.get('/')
      .then((): any => browser.wait(() => element(by.css('.restart-build')).isPresent()))
      .then(() => element.all(by.css('.restart-build')).first().click())
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => count > 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).count()
          .then(c => c === 3);
      })
      .then(() => element.all(by.css('.stop-build')).first().click())
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => {
            if (count === 0) {
              return true;
            } else {
              return false;
            }
          });
      })));
  });
});
