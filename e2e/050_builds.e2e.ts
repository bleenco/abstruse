import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, delay } from './utils';
import { request as pushEventRequest, header as pushEventHeader }
  from '../tests/e2e/webhooks/github/PushEvent';
import { requestOpened, requestReopened, header as pullRequestHeader }
  from '../tests/e2e/webhooks/github/PullRequestEvent';
import { sendRequest } from '../tests/e2e/utils/utils';

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
      .then(() => isLoaded())
      .then(() => browser.wait(() => element(by.css('.is-info')).isPresent()))
      .then(() => expect(element(by.css('.is-info')).getText())
        .toContain('No builds has been runned yet.'));
  });

  it('should start new build (send push event)', () => {
    return sendRequest(pushEventRequest, pushEventHeader)
      .then(() => browser.get('/'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()));
  });

  it('should redirect after click on first build', () => {
    return browser.get('/')
      .then(() => isLoaded())
      .then(() => browser.wait(() => element(by.css('.list-item')).isPresent())
      .then(() => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      })))
      .then(() => element(by.css('.list-item')).click())
      .then(() => delay(500))
      .then(() => isLoaded())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/build/1'));
  });

  it('should start new build (send open_pull_request event)', () => {
    return sendRequest(requestOpened, pullRequestHeader)
      .then(() => browser.get('/'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent())
      .then(() => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      })))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => delay(1000))
      .then((): any => isLoaded())
      .then((): any => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/build/2'));
  });

  it('should start new build (send open_pull_request event)', () => {
    return sendRequest(requestReopened, pullRequestHeader)
      .then(() => browser.get('/'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent())
      .then(() => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css('.list-item')));
      })))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then(() => delay(1000))
      .then((): any => isLoaded())
      .then((): any => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/build/3'));
  });
});
