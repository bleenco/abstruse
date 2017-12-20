import { browser, by, element, ExpectedConditions } from 'protractor';
import { login, logout, waitForUrlToChangeTo, isLoaded, delay } from './utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('Repository', () => {
  before(() => login().then(() => browser.waitForAngularEnabled(false)));
  after(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should redirect to d3 repository, and trigger test build', () => {
    return  browser.get('/repositories')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 2);
      }))
      .then((): any => element.all(by.css('.list-item')).last().click())
      .then((): any => browser.wait(() => element(by.css(`[name="btn-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-settings"]`)));
      }))
      .then((): any => element(by.css('[name="btn-settings"]')).click())
      .then((): any => browser.wait(() => {
        return element(by.css(`[name="trigger-test-build"]`)).isPresent();
      }))
      .then(() => element.all(by.css(`[name="trigger-test-build"]`)).first())
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then((): any => browser.wait(() => {
        return element(by.css(`[name="trigger-test-build"]`)).isEnabled();
      }))
      .then((): any => element(by.css('[name="trigger-test-build"]')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.green')).count().then(count => count === 1);
      }))
      .then(() => element(by.css('.green')).getAttribute('innerHTML'))
      .then(html => expect(html).to.includes('Build successfully triggered'))
      .then(() => delay(1000))
      .then(() => browser.get('/'))
      .then(() => isLoaded())
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 5;
      })))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isEnabled();
      }))
      .then(() => delay(2000))
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should redirect to d3 repository, check build configuration file and run build', () => {
    return  browser.get('/repositories')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 2);
      }))
      .then((): any => element.all(by.css('.list-item')).last().click())
      .then((): any => browser.wait(() => element(by.css(`[name="btn-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-settings"]`)));
      }))
      .then((): any => element(by.css('[name="btn-settings"]')).click())
      .then((): any => browser.wait(() => {
        return element(by.css(`[name="fetch-config"]`)).isPresent();
      }))
      .then(() => element.all(by.css(`[name="fetch-config"]`)).first())
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then((): any => browser.wait(() => {
        return element(by.css(`[name="fetch-config"]`)).isEnabled();
      }))
      .then((): any => element(by.css('[name="fetch-config"]')).click())
      .then((): any => browser.wait(() => {
        return element(by.css(`[name="run-build-from-config"]`)).isPresent();
      }))
      .then(() => element.all(by.css(`[name="run-build-from-config"]`)).first())
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then((): any => browser.wait(() => {
        return element(by.css(`[name="run-build-from-config"]`)).isEnabled();
      }))
      .then((): any => browser.wait(() => {
        const selector = `[name="run-build-from-config"]`;
        return ExpectedConditions.elementToBeClickable(element(by.css(selector)));
      }))
      .then(() => delay(2000))
      .then((): any => element(by.css(`[name="run-build-from-config"]`)).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.green')).count().then(count => count === 1);
      }))
      .then(() => element(by.css('.green')).getAttribute('innerHTML'))
      .then(html => expect(html).to.includes('Build has been run successfully'))
      .then(() => delay(2000))
      .then(() => browser.get('/'))
      .then(() => isLoaded())
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 5;
      })))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isPresent();
      }))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.stop-build')).first().isEnabled();
      }))
      .then(() => delay(2000))
      .then((): any => element.all(by.css('.stop-build')).first().click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 0);
      }));
  });

  it('should redirect to d3 repository, check repository configurations', () => {
    return  browser.get('/repositories')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 2);
      }))
      .then((): any => element.all(by.css('.list-item')).last().click())
      .then((): any => browser.wait(() => element(by.css(`[name="btn-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-settings"]`)));
      }))
      .then((): any => element(by.css('[name="btn-settings"]')).click())
      .then((): any => browser.wait(() => {
        return element(by.css(`[name="check-repository-configuration"]`)).isPresent();
      }))
      .then(() => element.all(by.css(`[name="check-repository-configuration"]`)).first())
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then((): any => browser.wait(() => {
        return element(by.css(`[name="check-repository-configuration"]`)).isEnabled();
      }))
      .then((): any => element(by.css('[name="check-repository-configuration"]')).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.green')).count().then(count => count === 1);
      }))
      .then(() => element.all(by.css('.ion-checkmark-round')).count())
      .then(cnt => expect(cnt).to.equals(3));
  });

  it('should redirect to bterm repository, and update its repository provider', () => {
    return  browser.get('/repositories')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 2);
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => browser.wait(() => element(by.css(`[name="btn-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-settings"]`)));
      }))
      .then((): any => element(by.css('[name="btn-settings"]')).click())
      .then(() => browser.wait(() => {
        return element(by.css('[name="repository_provider"]')).isPresent();
      }))
      .then(() => element(by.css('[name="repository_provider"]')).click())
      .then(() => element.all(by.css('.selectbox-option')).last().click())
      .then((): any => browser.wait(() => element(by.css(`[name="save-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`[name="save-settings"]`)).isEnabled()))
      .then((): any => browser.wait(() => ExpectedConditions.elementToBeClickable(
        element(by.css(`[name="save-settings"]`)))))
      .then(() => element(by.css(`[name="save-settings"]`)))
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then(() => element(by.css(`[name="save-settings"]`)).click())
      .then(() => browser.get('/repo/1?tab=settings'))
      .then((): any => isLoaded())
      .then((): any => browser.wait(() => {
        return element.all(by.css(`.selectbox-value`)).first().isPresent();
      })
      .then(() => element.all(by.css('.selectbox-value')).first().getText())
      .then(txt => expect(txt).to.equals('Gogs')));
  });

  it('should redirect to bterm repository, and update its api url', () => {
    return  browser.get('/repositories')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 2);
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => browser.wait(() => element(by.css(`[name="btn-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-settings"]`)));
      }))
      .then((): any => element(by.css('[name="btn-settings"]')).click())
      .then(() => browser.wait(() => element(by.css('.form-input[name="api_url"]')).isPresent()))
      .then(() => element(by.css('.form-input[name="api_url"]')).sendKeys('2'))
      .then((): any => browser.wait(() => element(by.css(`[name="save-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`[name="save-settings"]`)).isEnabled()))
      .then((): any => browser.wait(() => ExpectedConditions.elementToBeClickable(
        element(by.css(`[name="save-settings"]`)))))
      .then(() => element(by.css(`[name="save-settings"]`)))
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then(() => element(by.css(`[name="save-settings"]`)).click())
      .then(() => browser.get('/repo/1?tab=settings'))
      .then((): any => isLoaded())
      .then(() => browser.wait(() => element(by.css('.form-input[name="api_url"]')).isPresent()))
      .then(() => element(by.css('.form-input[name="api_url"]')).getAttribute('value'))
      .then(txt => expect(txt).to.equals('https://api.github.com2'));
  });

  it('should redirect to bterm repository, and mark its as private', () => {
    return  browser.get('/repositories')
      .then((): any => browser.wait(() => {
        return element.all(by.css('.list-item')).count().then(count => count === 2);
      }))
      .then((): any => element.all(by.css('.list-item')).first().click())
      .then((): any => browser.wait(() => element(by.css(`[name="btn-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-settings"]`)));
      }))
      .then((): any => element(by.css('[name="btn-settings"]')).click())
      .then(() => browser.wait(() => element(by.css('.toggle-button')).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`.toggle-button`)).isEnabled()))
      .then(() => element(by.css(`.toggle-button`)).click())
      .then((): any => browser.wait(() => element(by.css(`[name="save-settings"]`)).isPresent()))
      .then((): any => browser.wait(() => element(by.css(`[name="save-settings"]`)).isEnabled()))
      .then((): any => browser.wait(() => ExpectedConditions.elementToBeClickable(
        element(by.css(`[name="save-settings"]`)))))
      .then(() => element(by.css(`[name="save-settings"]`)))
      .then(ele => browser.executeScript('arguments[0].scrollIntoView();', ele.getWebElement()))
      .then(() => element(by.css(`[name="save-settings"]`)).click())
      .then(() => browser.get('/repo/1?tab=settings'))
      .then((): any => isLoaded())
      .then(() => browser.wait(() => element(by.css('.toggle-button')).isPresent()))
      .then(() => element.all(by.css('.toggle-button enabled')).count())
      .then(cnt => expect(cnt).to.equals(0));
  });
});
