import { browser, by, element, ExpectedConditions } from 'protractor';
import { login, logout, delay } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('Images', () => {
  before(() => login().then(() => browser.waitForAngularEnabled(false)));
  after(() => logout().then(() => browser.waitForAngularEnabled(true)));

  xit('should go to images and see one base image', () => {
    return  browser.get('/images')
      .then(() => element.all(by.css('.image-item')).count())
      .then(cnt => expect(cnt).to.equals(0))
      .then(() => element.all(by.css('.base-image-item')).count())
      .then(cnt => {
        if (cnt > 0) {
          Promise.resolve();
        } else {
          return browser.wait(() => element(by.css(`[name="tab-build-image"]`)).isPresent())
            .then((): any => element(by.css('[name="tab-build-image"]')).click())
            .then((): any => browser.wait(() => {
              return element(by.css(`[name="build-image-btn"]`)).isPresent();
            }))
            .then((): any => browser.wait(() => {
              return element(by.css(`[name="build-image-btn"]`)).isEnabled();
            }))
            .then(() => element.all(by.css(`[name="build-image-btn"]`)).first().click());
        }
      })
      .then(() => delay(5000))
      .then((): any => {
        return browser.wait(() => element.all(by.css('.base-image-item')).count()
          .then(cnt => cnt === 1));
      });
  });

  xit('should start building a new base image with name test-protractor-base-image', () => {
    return  browser.get('/images')
      .then((): any => browser.wait(() => element(by.css(`[name="tab-build-image"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="tab-build-image"]`)));
      }))
      .then((): any => element(by.css('[name="tab-build-image"]')).click())
      .then(() => delay(1000))
      .then(() => browser.wait(() => element(by.css('[name="imageType"]')).isPresent()))
      .then(() => element(by.css('[name="imageType"]')).click())
      .then(() => element.all(by.css('.selectbox-option')).last().click())
      .then((): any => browser.wait(() => element(by.css('.image-name-input')).isPresent()))
      .then((): any => element(by.css('.image-name-input')).clear())
      .then((): any => element(by.css('.image-name-input')).sendKeys('test-protractor-base-image'))
      .then((): any => browser.wait(() => element(by.css(`[name="build-image-btn"]`)).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`[name="build-image-btn"]`)).isEnabled()))
      .then(() => element.all(by.css(`[name="build-image-btn"]`)).first().click());
  });

  xit('should go to images and see two base images', () => {
    return  browser.get('/images')
      .then(() => element.all(by.css('.image-item')).count())
      .then(cnt => expect(cnt).to.equals(0))
      .then((): any => {
        return browser.wait(() => element.all(by.css('.base-image-item')).count()
          .then(cnt => cnt === 2));
      });
  });

  xit('should see drop down with two base images when try to build new custom image', () => {
    return  browser.get('/images')
      .then((): any => browser.wait(() => element(by.css(`[name="tab-build-image"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="tab-build-image"]`)));
      }))
      .then((): any => element(by.css('[name="tab-build-image"]')).click())
      .then(() => delay(1000))
      .then(() => element.all(by.css('.selectbox-value')).first().getText())
      .then(type => expect(type).to.equals('Custom Image'))
      .then((): any => browser.wait(() => element(by.css('.image-name-input')).isPresent()))
      .then((): any => element(by.css('.image-name-input')).clear())
      .then((): any => {
        return element(by.css('.image-name-input')).sendKeys('test-protractor-custom-image');
      })
      .then(() => browser.wait(() => element(by.css('[name="baseImage"]')).isPresent()))
      .then(() => browser.wait(() => element(by.css('[name="baseImage"]')).isDisplayed()))
      .then(() => element(by.css('[name="baseImage"]')).click())
      .then(() => element.all(by.css('.selectbox-option')).last().click())
      .then(() => delay(1000))
      .then(() => element.all(by.css('.view-line')).first().getText())
      .then(txt => expect(txt).to.equals('FROM test-protractor-base-image'));
  });

  xit('should try to delete last base image and cancel it at last warning', () => {
    return  browser.get('/images')
      .then((): any => {
        return browser.wait(() => element.all(by.css('.base-image-item')).count()
          .then(cnt => cnt === 2));
      })
      .then(() => browser.wait(() => element(by.css('.ion-close')).isPresent()))
      .then(() => browser.wait(() => element(by.css('.ion-close')).isDisplayed()))
      .then(() => element(by.css('.ion-close')).click())
      .then(() => element.all(by.css('.ion-close')).count())
      .then(cnt => expect(cnt).to.equals(4))
      .then(() => browser.wait(() => element(by.css('.ion-checkmark')).isPresent()))
      .then(() => browser.wait(() => element(by.css('.ion-checkmark')).isDisplayed()))
      .then(() => element.all(by.css('.ion-close')).first().click())
      .then(() => delay(500))
      .then((): any => {
        return browser.wait(() => element.all(by.css('.base-image-item')).count()
          .then(cnt => cnt === 2));
      })
      .then(() => element.all(by.css('.ion-close')).count())
      .then(cnt => expect(cnt).to.equals(3));
  });
});
