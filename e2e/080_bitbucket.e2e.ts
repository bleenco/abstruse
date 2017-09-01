import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, delay } from './utils';
import { request, header } from '../tests/e2e/webhooks/bitbucket/PushEvent';
import { request as prReq, headerPullRequestCreated }
  from '../tests/e2e/webhooks/bitbucket/PullRequestEvent';
import { sendBitBucketRequest } from '../tests/e2e/utils/utils';


describe('Bitbucket repositories', () => {
  let originalTimeout: number;
  beforeAll(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;
    login().then(() => browser.waitForAngularEnabled(false));
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    logout().then(() => browser.waitForAngularEnabled(true));
  });

  it('should add bitbucket repository and start new build (send push event)', () => {
    return browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      })
      .then(() => sendBitBucketRequest(request, header))
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then(() => browser.get('/repositories'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.bold')).isPresent()))
      .then(() => expect(element.all(by.css('.bold')).last().getText()).toContain('test'))
      .then(() => browser.get('/'))
      .then((): any => browser.wait(() => {
        return element(by.css('.list-item:nth-child(1) .stop-build')).isPresent();
      }))
      .then(() => delay(2000))
      .then((): any => element.all(by.css('.list-item:nth-child(1) .stop-build')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should start new build (send reopen_pull_request event)', () => {
    return sendBitBucketRequest(prReq, headerPullRequestCreated)
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => {
        return element(by.css('.build-time')).isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item:nth-child(1) .stop-build')).isPresent();
      }))
      .then((): any => {
        return browser.wait(() => {
          const el = element(by.css('.list-item:nth-child(1) .stop-build'));
          return ExpectedConditions.elementToBeClickable(el);
        });
      })
      .then(() => delay(2000))
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
      .then(() => delay(2000))
      .then((): any => element.all(by.css('.restart-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count > 0);
      }))
      .then((): any => browser.wait(() => {
        return element(by.css('.build-time')).isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isPresent();
      }))
      .then((): any => {
        return browser.wait(() => {
          const el = element(by.css('.stop-build'));
          return ExpectedConditions.elementToBeClickable(el);
        });
      })
      .then(() => delay(2000))
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });
});
