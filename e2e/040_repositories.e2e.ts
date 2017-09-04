import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout } from './utils';
import { request, header } from '../tests/e2e/webhooks/github/PingEvent';
import { sendGitHubRequest } from '../tests/e2e/utils/utils';

describe('Repositories', () => {

  beforeAll(() => login());

  afterAll(() => logout());

  it('should open repository page with zero repositories', () => {
    return browser.get('/repositories')
      .then(() => isLoaded())
      .then(() => {
        return expect(element(by.css('.is-info')).getText()).toContain('No repositories found.');
      });
  });

  it('should add repository bterm (send ping event)', () => {
    return sendGitHubRequest(request, header)
      .then(() => browser.get('/repositories'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.bold')).isPresent()))
      .then(() => expect(element(by.css('.bold')).getText()).toContain('bterm'));
  });

  it('should redirect to bterm repository, add new environment variable and then delete it', () => {
    return  browser.get('/repositories')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 1);
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/repo/1'))
      .then((): any => browser.wait(() => element(by.css(`[name="btn-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-settings"]`)));
      }))
      .then((): any => element(by.css('[name="btn-settings"]')).click())
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('test'))
      .then(() => element(by.css('.form-input[name="value"]')).sendKeys('test'))
      .then(() => element(by.css('[name="btn-add-variable"]')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item-slim')).count().then(count => count === 1);
      }))
      .then(() => element(by.css('[name="remove-variable"]')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item-slim')).count().then(count => count === 0);
      }));
  });
});
