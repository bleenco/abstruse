import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, waitForUrlToChangeTo } from './utils';
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
      .then(() => browser.get('/'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()));
  });

  it('should redirect after click on first build', () => {
    return browser.get('/')
      .then(() => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.list-item'))), 10000);
      })
      .then(() => element(by.css('.list-item')).click())
      .then(() => waitForUrlToChangeTo('http://localhost:6500/build/1'));
  });

  it('should stop last build', () => {
    browser.get('/')
      .then((): any => browser.wait(() => element(by.css('.stop-build')).isPresent()))
      .then(() => element(by.css('.stop-build')).click())
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => count === 0);
      }));
  });

  it('should start new build (send open_pull_request event)', () => {
    return sendGitHubRequest(requestOpened, pullRequestHeader)
      .then(() => browser.get('/'))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.list-item'))), 10000);
      })
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/2'));
  });

  it('should stop last build', () => {
    browser.get('/')
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => {
            if (count === 0) {
              return true;
            }
            element.all(by.css('.stop-build')).first().click();
          });
      }));
  });

  it('should start new build (send reopen_pull_request event)', () => {
    return sendGitHubRequest(requestReopened, pullRequestHeader)
      .then(() => browser.get('/'))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.list-item'))), 10000);
      })
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/3'));
  });

  it('should stop last build', () => {
    browser.get('/')
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => {
            if (count === 0) {
              return true;
            }
            element.all(by.css('.stop-build')).first().click();
          });
      }));
  });

  it('should restart last build', () => {
    browser.get('/')
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => count === 0);
      }))
      .then((): any => browser.wait(() => element(by.css('.restart-build')).isPresent()))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.restart-build'))), 10000);
      })
      .then(() => element.all(by.css('.restart-build')).first().click())
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => count > 0);
      }));
  });

  it('should stop last build', () => {
    browser.get('/')
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count()
          .then(count => {
            if (count === 0) {
              return true;
            }
            element.all(by.css('.stop-build')).first().click();
          });
      }));
  });
});
