import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, waitForUrlToChangeTo } from './utils';
import { request, header } from '../tests/e2e/webhooks/gogs/PushEvents';
import { pullRequestOpened, header as prHead } from '../tests/e2e/webhooks/gogs/PullRequestEvents';
import { sendGogsRequest } from '../tests/e2e/utils/utils';


describe('Teams', () => {
  beforeAll(() => login().then(() => browser.waitForAngularEnabled(false)));
  afterAll(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should see one user on team page', () => {
    return browser.get('/team')
    .then((): any => browser.wait(() => {
      return element.all(by.css('.list-item')).count().then(count => count === 1);
    }));
  });

  it('should add new user', () => {
    return browser.get('/team')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 1);
      }))
      .then((): any => element.all(by.css('[name="btn-addUser"]')).first().click())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('frank@gmail.com'))
      .then(() => element(by.css('.form-input[name="fullname"]')).sendKeys('Frank Milner'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="repeat_password"]')).sendKeys('test123'))
      .then(() => element(by.css('[name="btn-saveNewUser"]')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 2);
      }));
  });

  it('should redirect to team, user and then grant, revoke repository permission', () => {
    return browser.get('/')
      .then((): any => browser.wait(() => element(by.css('.nav-team')).isPresent()))
      .then((): any => element(by.css('.nav-team')).click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/team'))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/user/1'))
      .then(() => expect(element.all(by.css('h1')).first().getText()).toContain('John Wayne'))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.repositories .list-item')).count().then(count => count === 6);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restricted-repositories')).count().then(count => count === 0);
      }))
      .then((): any => element.all(by.css('[name="btn-removePermisison"]')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.repositories .list-item')).count().then(count => count === 5);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restricted-repositories .list-item')).count()
          .then(count => count === 1);
      }))
      .then((): any => element.all(by.css('[name="btn-addPermisison"]')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.repositories .list-item')).count().then(count => count === 6);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restricted-repositories')).count().then(count => count === 0);
      }));
  });
});
