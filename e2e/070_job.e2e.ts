import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, waitForUrlToChangeTo, delay } from './utils';


describe('Job Details', () => {
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

  xit('should restart job watch console log until it matches expected output', () => {
    return browser.get('/job/15')
      .then((): any => {
        return browser
          .wait(() => element(by.css('[name="btn-restart"]')).isPresent());
      })
      .then((): any => element(by.css('[name="btn-restart"]')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .command')).count().then(cnt => {
          return cnt === 6;
        });
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .output.is-hidden')).count().then(cnt => {
          return cnt === 5;
        });
      }))
      .then((): any => element.all(by.css('.terminal .command-line')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .command')).count().then(cnt => cnt === 6);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .output.is-hidden')).count().then(cnt => {
          return cnt === 4;
        });
      }));
  });

  xit('should restart build and watch job output', () => {
    return browser.get('/build/4')
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element(by.css('[name="restart-build"]')).isPresent()))
      .then((): any => element(by.css('[name="restart-build"]')).click())
      .then((): any => element.all(by.css('.list-item')).count())
      .then(num => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === num;
      })))
      .then(() => browser.get('/job/15'))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .command')).count().then(cnt => {
          return cnt === 6;
        });
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .output.is-hidden')).count().then(cnt => {
          return cnt === 5;
        });
      }))
      .then((): any => element.all(by.css('.terminal .command-line')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .command')).count().then(cnt => cnt === 6);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.terminal .output.is-hidden')).count().then(cnt => {
          return cnt === 4;
        });
      }));
  });
});
