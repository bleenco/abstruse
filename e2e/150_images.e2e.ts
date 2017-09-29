import { browser, by, element, ExpectedConditions } from 'protractor';
import { login, logout, delay } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('Images', () => {
  before(() => login().then(() => browser.waitForAngularEnabled(false)));
  after(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should go to images and see no images', () => {
    return  browser.get('/images')
      .then((): any => browser.wait(() => element(by.css(`[name="tab-images"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="tab-images"]`)));
      }))
      .then((): any => element(by.css('[name="tab-images"]')).click())
      .then(() => delay(1000))
      .then(() => element.all(by.css('.image-item')).count())
      .then(cnt => expect(cnt).to.equals(0));
  });

  xit('should go to images and build image with name test', () => {
    return  browser.get('/images')
      .then((): any => browser.wait(() => element(by.css('.image-name-input')).isPresent()))
      .then((): any => element(by.css('.image-name-input')).clear())
      .then((): any => element(by.css('.image-name-input')).sendKeys('test'))
      .then(() => element.all(by.css('.image-build-log')).count())
      .then(cnt => expect(cnt).to.equals(0))
      .then((): any => browser.wait(() => element(by.css('[name="build-image-btn"]')).isPresent()))
      .then((): any => browser.wait(() => element(by.css('[name="build-image-btn"]')).isEnabled()))
      .then(() => element.all(by.css(`[name="build-image-btn"]`)).first())
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="build-image-btn"]`)));
      }))
      .then((): any => element(by.css('[name="build-image-btn"]')).click())
      .then(() => delay(1000))
      .then((): any => browser.wait(() => element(by.css('.image-build-log')).isPresent()))
      .then(() => element.all(by.css('.image-build-log')).count())
      .then(cnt => expect(cnt).to.equals(1));
  });
});
