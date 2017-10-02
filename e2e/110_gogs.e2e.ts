import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, delay } from './utils';
import { request, header } from '../tests/e2e/webhooks/gogs/PushEvents';
import { pullRequestOpened, header as prHead } from '../tests/e2e/webhooks/gogs/PullRequestEvents';
import { sendGogsRequest } from '../tests/e2e/utils/utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('Gogs repositories', () => {
  before(() => login().then(() => browser.waitForAngularEnabled(false)));
  after(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should add gogs repository and start new build (send push event)', () => {
    return browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      })
      .then(() => sendGogsRequest(request, header))
      .then(() => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then(() => browser.get('/repositories'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.bold')).isPresent()))
      .then(() => expect(element.all(by.css('.bold')).last().getText()).to.include('test'))
      .then(() => browser.get('/'))
      .then((): any => browser.wait(() => {
        return element(by.css('.list-item:nth-child(1) .stop-build')).isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element(by.css('.list-item:nth-child(1) .stop-build')).isEnabled();
      }))
      .then(() => delay(2000))
      .then((): any => element.all(by.css('.list-item:nth-child(1) .stop-build')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should start new build (send reopen_pull_request event)', () => {
    return sendGogsRequest(pullRequestOpened, prHead)
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
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item:nth-child(1) .stop-build')).isEnabled();
      }))
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
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restart-build')).first().isEnabled();
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
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isEnabled();
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
