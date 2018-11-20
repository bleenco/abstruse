import { browser, by, element, ElementFinder } from 'protractor';

describe('setup', () => {

  describe('check software', () => {

    beforeEach(() => browser.get('/setup/check'));

    it('should have Docker installed and running', () => {
      element.all(by.css('.software-item-column .fa-check')).get(0).isDisplayed();
    });

    it('should have SQLite3 installed', () => {
      element.all(by.css('.software-item-column .fa-check')).get(1).isDisplayed();
    });

    it('should have git installed', () => {
      element.all(by.css('.software-item-column .fa-check')).get(2).isDisplayed();
    });

    it('should navigate to /setup/config when on next', () => {
      let button: ElementFinder;
      return Promise.resolve()
        .then(() => element(by.css('.setup-content-bottom .button.is-green')))
        .then(el => {
          button = el;
          return button.isEnabled();
        })
        .then(enabled => expect(enabled).toEqual(true))
        .then(() => button.click())
        .then(() => browser.getCurrentUrl())
        .then(currentUrl => expect(currentUrl).toContain('/setup/config'));
    });

  });

  describe('configuration', () => {

    beforeEach(() => browser.get('/setup/config'));

    it('should save configuration', async () => {
      let inputEl: ElementFinder;
      let saveButton: ElementFinder;
      return Promise.resolve()
        .then(() => element(by.css('input[name="concurrency"]')))
        .then(el => inputEl = el)
        .then(() => element.all(by.css('.buttons .button')).get(1))
        .then(el => saveButton = el)
        .then(() => inputEl.clear())
        .then(() => saveButton.isEnabled())
        .then(enabled => expect(enabled).toEqual(false))
        .then(() => inputEl.sendKeys(4))
        .then(() => saveButton.isEnabled())
        .then(enabled => expect(enabled).toEqual(true))
        .then(() => saveButton.click())
        .then(() => browser.waitForAngular())
        .then(() => inputEl.clear())
        .then(() => inputEl.sendKeys(10))
        .then(() => browser.waitForAngular())
        .then(() => element.all(by.css('.buttons .button')).get(0))
        .then(refreshButton => refreshButton.click())
        .then(() => browser.waitForAngular())
        .then(() => inputEl.getAttribute('value'))
        .then(val => expect(val).toEqual('4'));
    });

  });

});
