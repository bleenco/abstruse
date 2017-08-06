import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, waitForUrlToChangeTo, delay } from './utils';
import {
  request as pushEventRequest,
  header as pushEventHeader
} from '../tests/e2e/webhooks/github/PushEvent';
import {
  requestOpened, requestReopened,
  header as pullRequestHeader
} from '../tests/e2e/webhooks/github/PullRequestEvent';
import { sendGitHubRequest } from '../tests/e2e/utils/utils';
import { killAllContainers } from '../src/api/docker';

describe('Builds', () => {
  beforeAll(() => login().then(() => browser.waitForAngularEnabled(false)));
  afterAll(() => logout().then(() => browser.waitForAngularEnabled(true)));
  afterEach(() => delay(5000).then(() => killAllContainers()));

  afterEach(() => {
    return Promise.resolve(() => {
      return browser.wait(() => element.all(by.css('.disabled')).count().then(cnt => cnt === 0));
    });
  });

  it('should open first page with zero builds', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => element(by.css('.is-info')).isPresent()))
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
      .then((): any => element(by.css('.list-item')).click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/1'))
      .then(() => browser.navigate().back())
      .then((): any => browser.wait(() => {
        return element(by.css('.list-item:nth-child(1) .stop-build')).isPresent();
      }))
      .then((): any => element(by.css('.list-item:nth-child(1) .stop-build')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should start new build (send open_pull_request event)', () => {
    return sendGitHubRequest(requestOpened, pullRequestHeader)
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 2;
      })))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => {
        return element(by.css('.list-item:nth-child(1) .stop-build')).isPresent();
      }))
      .then((): any => element.all(by.css('.list-item:nth-child(1) .stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should start new build (send reopen_pull_request event)', () => {
    return sendGitHubRequest(requestReopened, pullRequestHeader)
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 3;
      })))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item:nth-child(1) .stop-build')).first().isPresent();
      }))
      .then((): any => {
        return browser.wait(() => {
          const el = element(by.css('.list-item:nth-child(1) .stop-build'));
          return ExpectedConditions.elementToBeClickable(el);
        });
      })
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should restart last build', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restart-build')).first().isPresent();
      }))
      .then((): any => element.all(by.css('.restart-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count > 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => {
        return browser.wait(() => {
          const el = element(by.css('.list-item:nth-child(1) .stop-build'));
          return ExpectedConditions.elementToBeClickable(el);
        });
      })
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item:nth-child(1) .stop-build')).first().isPresent();
      }))
      .then((): any => element.all(by.css('.list-item:nth-child(1) .stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });
});
