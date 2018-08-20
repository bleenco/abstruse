import { browser, by, element, ExpectedConditions } from 'protractor';
import { delay, isLoaded, login, logout, waitForUrlToChangeTo } from './utils';
import { header as pushEventHeader, requestD3 } from '../tests/e2e/webhooks/github/PushEvent';
import { sendGitHubRequest } from '../tests/e2e/utils/utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Builds', () => {
  before(() => login().then(() => browser.waitForAngularEnabled(false)));
  after(() => logout().then(() => browser.waitForAngularEnabled(true)));

  afterEach(() => {
    return Promise.resolve(() => {
      return browser.wait(() => element.all(by.css('.disabled')).count().then(cnt => cnt === 0));
    });
  });

  it('should open first page with zero builds', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => element(by.css('.notification')).isPresent()))
      .then(() => expect(element(by.css('.notification')).getText())
        .to.eventually.have.string('No builds has been run yet.'));
  });

  it('should start new build (send open_pull_request event)', () => {
    return sendGitHubRequest(requestD3, pushEventHeader)
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 1;
      })))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => {
        return element(by.css('.build-time')).isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item:nth-child(1) .stop-build')).first().isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item:nth-child(1) .stop-build')).first().isEnabled();
      }))
      .then(() => delay(2000))
      .then(() => element.all(by.css('.list-item:nth-child(1) .stop-build')).first())
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item:nth-child(1) .stop-build')).first().isDisplayed();
      }))
      .then((): any => element.all(by.css('.list-item:nth-child(1) .stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should redirect after click on first build', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => element(by.css('.list-item')).click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/1'))
      .then(() => browser.navigate().back())
      .then((): any => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/'));
  });

  it('should start new build (send reopen_pull_request event)', () => {
    return sendGitHubRequest(requestD3, pushEventHeader)
    .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 2;
      })))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => {
        return element(by.css('.build-time')).isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => element.all(by.css('.stop-build')).first().isPresent()))
      .then((): any => browser.wait(() => element.all(by.css('.stop-build')).first().isEnabled()))
      .then((): any => {
        return browser.wait(() => {
          const el = element.all(by.css('.stop-build')).first();
          return ExpectedConditions.elementToBeClickable(el);
        });
      })
      .then(() => delay(2000))
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should start new build (send push event)', () => {
    return sendGitHubRequest(requestD3, pushEventHeader)
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 3;
      })))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => element(by.css('.build-time')).isPresent()))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => element.all(by.css('.stop-build')).first().isPresent()))
      .then((): any => browser.wait(() => element.all(by.css('.stop-build')).first().isEnabled()))
      .then((): any => {
        return browser.wait(() => {
          const el = element.all(by.css('.stop-build')).first();
          return ExpectedConditions.elementToBeClickable(el);
        });
      })
      .then(() => delay(2000))
      .then((): any => browser.wait(() => element.all(by.css('.stop-build')).first().isDisplayed()))
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should restart last build and send same push event, the old build should stop', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
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
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then(() => sendGitHubRequest(requestD3, pushEventHeader))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isDisplayed();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isEnabled();
      }))
      .then(() => delay(2000))
      .then((): any => {
        return browser.wait(() =>
          ExpectedConditions.elementToBeClickable(element.all(by.css('.stop-build')).first()));
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
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restart-build')).first().isEnabled();
      }))
      .then(() => delay(2000))
      .then((): any => element.all(by.css('.restart-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count > 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.build-time')).first().isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.build-time')).first().isDisplayed();
      }))
      .then((): any => {
        return browser.wait(() => element.all(by.css('.build-time')).first()
          .getAttribute('innerHTML').then(html => html.trim() === '00:04'));
      })
      .then(() => browser.get('/'))
      .then(() => isLoaded())
      .then(() => delay(1000))
      .then((): any => {
        return browser.wait(() => element.all(by.css('.build-time')).first()
          .getAttribute('innerHTML').then(html => html.trim() === '00:08'));
      })
      .then((): any => browser.wait(() => {
        return element.all(by.css('.disabled')).count().then(cnt => cnt === 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isDisplayed();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isEnabled();
      }))
      .then(() => delay(2000))
      .then((): any => {
        return browser.wait(() =>
          ExpectedConditions.elementToBeClickable(element.all(by.css('.stop-build')).first()));
      })
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });
});
