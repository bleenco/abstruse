import { browser, by, element, ExpectedConditions } from 'protractor';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { isLoaded, login, logout, delay } from './utils';
import { request, header } from '../tests/e2e/webhooks/github/PingEvent';
import { sendGitHubRequest } from '../tests/e2e/utils/utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Repositories', () => {
  before(() => login());
  after(() => logout());

  it('should open repository page with zero repositories', () => {
    return browser.get('/repositories')
      .then(() => isLoaded())
      .then(() => {
        return expect(element(by.css('.is-info')).getText())
          .to.eventually.have.string('No repositories found.');
      });
  });

  it('should add repository bterm (send ping event)', () => {
    return sendGitHubRequest(request, header)
      .then(() => browser.get('/repositories'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => element(by.css('.bold')).isPresent()))
      .then(() => {
        return expect(element(by.css('.bold')).getText())
          .to.eventually.have.string('bterm');
      });
  });

  it('should redirect to bterm repository, add environment variable and then delete it', () => {
    return  browser.get('/repositories')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 1);
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => browser.getCurrentUrl())
      .then(url => expect(url).to.equal('http://localhost:6500/repo/1?tab=builds'))
      .then((): any => browser.wait(() => element(by.css(`[name="btn-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-settings"]`)));
      }))
      .then((): any => element(by.css('[name="btn-settings"]')).click())
      .then(() => element(by.css('.form-input[name="name"]')).sendKeys('test'))
      .then(() => element(by.css('.form-input[name="value"]')).sendKeys('test'))
      .then((): any => browser.wait(() => element(by.css(`[name="btn-add-variable"]`)).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`[name="btn-add-variable"]`)).isEnabled()))
      .then((): any => browser.wait(() => ExpectedConditions.elementToBeClickable(
        element(by.css(`[name="btn-add-variable"]`)))))
      .then(() => element(by.css(`[name="btn-add-variable"]`)))
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then(() => element(by.css(`[name="btn-add-variable"]`)).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item-mini')).count().then(count => count === 1);
      }))
      .then((): any => browser.wait(() => element(by.css(`[name="remove-variable"]`)).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`[name="remove-variable"]`)).isEnabled()))
      .then((): any => browser.wait(() => ExpectedConditions.elementToBeClickable(
        element(by.css(`[name="remove-variable"]`)))))
      .then(() => element(by.css(`[name="remove-variable"]`)))
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then(() => element(by.css(`[name="remove-variable"]`)).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item-mini')).count().then(count => count === 0);
      }));
  });
});
