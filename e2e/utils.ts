import { browser, by, element } from 'protractor';

export function isLoaded() {
  return browser.wait(() => {
    return element(by.css('.main-loader')).isDisplayed()
      .then(isDisplayed => !isDisplayed)
      .catch(() => true);
  });
}

export function waitForUrlToChangeTo(expectedUrl) {
  return browser.wait(() => {
    return browser.getCurrentUrl()
      .then(url => url.indexOf(expectedUrl) !== -1);
  });
}

export function login(): any {
  return browser.get('/login')
    .then(() => browser.waitForAngularEnabled(false))
    .then(() => isLoaded())
    .then(() => element(by.css('.form-input[name="email"]')).sendKeys('john@gmail.com'))
    .then(() => element(by.css('.form-input[name="password"]')).sendKeys('test123'))
    .then(() => element(by.css('.login-button')).click())
    .then(() => isLoaded())
    .then(() => browser.waitForAngularEnabled(true));
}

export function logout(): any {
  return browser.get('/')
    .then(() => browser.waitForAngularEnabled(false))
    .then(() => isLoaded())
    .then(() => browser.wait(() => element(by.css('.user-item')).isPresent()))
    .then(() => element(by.css('.user-item')).click())
    .then(() => element.all(by.css('.nav-dropdown-item')).last().click())
    .then(() => isLoaded())
    .then(() => browser.getCurrentUrl())
    .then(url => expect(url).toEqual('http://localhost:6500/login'))
    .then(() => browser.waitForAngularEnabled(true));
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
