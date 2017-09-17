import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, delay } from './utils';
import { request, header } from '../tests/e2e/webhooks/gitlab/PushEvents';
import { request as prReq, header as prHead } from '../tests/e2e/webhooks/gitlab/MergeEvents';
import { sendGitLabRequest } from '../tests/e2e/utils/utils';


describe('Gitlab repositories', () => {
  beforeAll(() => login().then(() => browser.waitForAngularEnabled(false)));
  afterAll(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should add gitlab repository and start new build (send push event)', () => {
    return browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      })
      .then(() => sendGitLabRequest(request, header))
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
    return sendGitLabRequest(prReq, prHead)
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
