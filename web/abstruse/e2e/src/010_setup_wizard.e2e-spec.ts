import { browser, by, element } from 'protractor';
import { waitForURLToChangeTo } from './utils';

describe('Setup Wizard', () => {
  it('should automatically navigate to /setup/security', async () => {
    await browser.get(browser.baseUrl);
    await browser.waitForAngularEnabled(false);
    await waitForURLToChangeTo('/setup/security');
    return true;
  });
});
