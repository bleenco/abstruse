import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, waitForUrlToChangeTo } from './utils';
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
      .then(() => console.log('111111111111'))
      .then(() => browser.get('/'))
      .then(() => console.log('111111111111'))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => console.log('111111111111'))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.list-item'))), 10000);
      })
      .then(() => console.log('111111111111'))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => console.log('111111111111'))
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/build/'));
  });

  it('should stop job', () => {
    return browser.get('/')
      .then(() => console.log('000000000000000000000'))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => console.log('000000000000000000000'))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => console.log('000000000000000000000'))
      .then(() => waitForUrlToChangeTo('http://localhost:6500/build/'))
      .then(() => console.log('000000000000000000000'))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => console.log('000000000000000000000'))
      .then(() => waitForUrlToChangeTo('http://localhost:6500/job/'))
      .then(() => console.log('000000000000000000000'))
      .then((): any => browser.wait(() => {
        return element(by.css('[name="btn-stop"]')).isPresent()
          .then(isPresent => isPresent);
      }))
      .then(() => console.log('000000000000000000000'))
      .then((): any => element(by.css('[name="btn-restart"]')).click())
      .then(() => console.log('000000000000000000000'))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('[name="btn-stop"]'))), 10000);
      })
      .then(() => console.log('000000000000000000000'))
      .then((): any => element(by.css('[name="btn-stop"]')).click())
      .then(() => console.log('000000000000000000000'))
      .then(() => browser.wait(() => {
        return element.all(by.css('.yellow')).count()
          .then(count => count === 0);
      }));
  });

  it('should restart job', () => {
    return browser.get('/')
      .then(() => console.log('111111111111'))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => console.log('111111111111'))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('.list-item'))), 10000);
      })
      .then(() => console.log('111111111111'))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => console.log('111111111111'))
      .then(() => waitForUrlToChangeTo('http://localhost:6500/build/'))
      .then(() => console.log('111111111111'))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then(() => console.log('111111111111'))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      }))
      .then(() => console.log('111111111111'))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => console.log('111111111111'))
      .then(() => waitForUrlToChangeTo('http://localhost:6500/job/'))
      .then(() => console.log('111111111111'))
      .then((): any => browser.wait(() => element(by.css('[name="btn-restart"]')).isDisplayed()))
      .then(() => {
        return browser.wait(
          ExpectedConditions.elementToBeClickable(element(by.css('[name="btn-restart"]'))), 10000);
      })
      .then(() => console.log('111111111111'))
      .then((): any => element(by.css('[name="btn-restart"]')).click())
      .then(() => console.log('111111111111'))
      .then(() => browser.wait(() => {
        return element.all(by.css('.yellow')).count()
          .then(count => count > 0);
      }));
  });

  it('should stop last build', () => {
    browser.get('/')
      .then(() => console.log('000000000000000000000'))
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
