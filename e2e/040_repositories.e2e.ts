import { browser, by, element } from 'protractor';
import { isLoaded, login, logout } from './utils';
import { request, header } from '../tests/e2e/webhooks/github/PingEvent';
import { sendRequest } from '../tests/e2e/utils/utils';

describe('Repositories', () => {

  beforeAll(() => {
    login();
  });

  afterAll(() => {
    logout();
  });

  it('should open repository page with zero repositories', () => {
    return browser.get('/repositories')
      .then(() => isLoaded())
      .then(() => {
        return expect(element(by.css('.is-info')).getText()).toContain('No repositories found.');
      });
  });

  it('should add repository bterm (send ping event)', () => {
    return sendRequest(request, header)
      .then(() => browser.get('/repositories'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.bold')).isPresent()))
      .then(() => expect(element(by.css('.bold')).getText()).toContain('bterm'));
  });

});
