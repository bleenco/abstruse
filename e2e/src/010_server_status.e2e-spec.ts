import { browser, by, element } from 'protractor';

class StatusPage {
  navigateTo() {
    return browser.get('/setup/check');
  }
}

describe('server status', () => {
  let page: StatusPage;

  beforeEach(() => {
    page = new StatusPage();
    page.navigateTo();
  });

  it('should have Docker installed and running', () => {
    element.all(by.css('.software-item-column .fa-check')).get(0).isDisplayed();
  });

  it('should have SQLite3 installed', () => {
    element.all(by.css('.software-item-column .fa-check')).get(1).isDisplayed();
  });

  it('should have git installed', () => {
    element.all(by.css('.software-item-column .fa-check')).get(2).isDisplayed();
  });

});
