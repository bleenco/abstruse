import { browser, by, element, ExpectedConditions } from 'protractor';
import { login, logout, waitForUrlToChangeTo, isLoaded, delay } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('Teams', () => {
  before(() => login());

  it('should see one user on team page', () => {
    return browser.get('/team')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.team-user-item')).count().then(count => count === 1);
      }));
  });

  it('should add new user', () => {
    return browser.get('/team')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.team-user-item')).count().then(count => count === 1);
      }))
      .then((): any => element.all(by.css('[name="btn-addUser"]')).first().click())
      .then(() => element(by.css('.form-input[name="email"]')).sendKeys('frank@gmail.com'))
      .then(() => element(by.css('.form-input[name="fullname"]')).sendKeys('Frank Milner'))
      .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.form-input[name="repeat_password"]')).sendKeys('test123'))
      .then(() => element(by.css('[name="btn-saveNewUser"]')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.team-user-item')).count().then(count => count === 2);
      }));
  });

  it('should redirect to team, user and then grant, revoke repository permission', () => {
    return browser.get('/team')
      .then((): any => browser.wait(() => element(by.css('.edit-user-button')).isPresent()))
      .then((): any => element.all(by.css('.edit-user-button')).last().click())
      .then((): any => waitForUrlToChangeTo('http://localhost:6500/user/2'))
      .then((): any => browser.wait(() => element(by.css(`[name="tab-permissions"]`)).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`[name="tab-permissions"]`)).isEnabled()))
      .then((): any => element(by.css('[name="tab-permissions"]')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.border-green')).count().then(count => count === 2);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.border-red')).count().then(count => count === 0);
      }))
      .then((): any => browser.wait(() => element.all(by.css(`[name="btn-removePermission"]`))
        .first().isPresent()))
      .then((): any => browser.wait(() => element.all(by.css(`[name="btn-removePermission"]`))
        .first().isEnabled()))
      .then((): any => browser.wait(() => ExpectedConditions.elementToBeClickable(
        element.all(by.css(`[name="btn-removePermission"]`)).first())))
      .then(() => element.all(by.css(`[name="btn-removePermission"]`)).first())
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then((): any => element.all(by.css('[name="btn-removePermission"]')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.border-green')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.border-red')).count()
          .then(count => count === 1);
      }))
      .then((): any => browser.wait(() => element.all(by.css(`[name="btn-addPermission"]`))
        .first().isPresent()))
      .then((): any => browser.wait(() => element.all(by.css(`[name="btn-addPermission"]`))
        .first().isEnabled()))
      .then((): any => browser.wait(() => ExpectedConditions.elementToBeClickable(
        element.all(by.css(`[name="btn-addPermission"]`)).first())))
      .then(() => element.all(by.css(`[name="btn-addPermission"]`)).first())
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then((): any => element.all(by.css('[name="btn-addPermission"]')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.border-green')).count().then(count => count === 2);
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.border-red')).count().then(count => count === 0);
      }));
  });

  xit(`should logout, access page as annonymous, see public build, job, but can't restart it`,
    () => {
    return logout()
      .then(() => isLoaded())
      .then(() => browser.get('/login'))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/login'))
      .then((): any => browser.wait(() => element(by.css('.centered-anonymous')).isPresent()))
      .then((): any => browser.wait(() => element(by.css('.centered-anonymous')).isEnabled()))
      .then((): any => element(by.css('.centered-anonymous')).click())
      .then((): any => element.all(by.css('.list-item')).count())
      .then(cnt => cnt > 0 ? Promise.resolve() : Promise.reject(-1))
      .then((): any => element.all(by.css('.restart-build')).count())
      .then(cnt => cnt === 0 ? Promise.resolve() : Promise.reject(-1))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isPresent()))
      .then((): any => browser.wait(() => element(by.css('.list-item')).isEnabled()))
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
