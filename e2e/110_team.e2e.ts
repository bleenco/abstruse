import { browser, by, element } from 'protractor';
import { login, logout, waitForUrlToChangeTo, isLoaded, delay } from './utils';


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
        return element.all(by.css('.repositories .list-item')).count().then(count => count === 5);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restricted-repositories')).count().then(count => count === 0);
      }))
      .then((): any => element.all(by.css('[name="btn-removePermisison"]')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.repositories .list-item')).count().then(count => count === 4);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restricted-repositories .list-item')).count()
          .then(count => count === 1);
      }))
      .then((): any => element.all(by.css('[name="btn-addPermisison"]')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.repositories .list-item')).count().then(count => count === 5);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.restricted-repositories')).count().then(count => count === 0);
      }));
  });

  it(`should logout, access page as annonymous, see public build, job, but can't restart it`,
  () => {
    return browser.get('/')
      .then(() => isLoaded())
      .then(() => browser.wait(() => element(by.css('.user-item')).isPresent()))
      .then(() => element(by.css('.user-item')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click())
      .then(() => isLoaded())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:6500/login'))
      .then((): any => browser.wait(() => element(by.css('.centered-anonymous')).isPresent()))
      .then((): any => element(by.css('.centered-anonymous')).click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/'))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count > 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item .restart-build')).count().then(count => count === 0);
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count > 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('[name="restart-build"]')).count().then(count => count === 0);
      }))
      .then(() => delay(1000))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('app-terminal')).count().then(count => count > 0);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('[name="btn-restart"]')).count().then(count => count === 0);
      }));
  });
});
