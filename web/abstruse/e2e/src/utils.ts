import { browser, by, element, promise } from 'protractor';

export function waitForURLToChangeTo(expectedURL: string): promise.Promise<boolean> {
  return browser.wait(async () => {
    const url = await browser.getCurrentUrl();
    return url.indexOf(expectedURL) !== -1;
  });
}
