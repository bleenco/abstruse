import { browser, by, element, ExpectedConditions } from 'protractor';
import { login, logout, delay } from './utils';
import { requestD3, header } from '../tests/e2e/webhooks/github/PushEvent';
import { sendGitHubRequest } from '../tests/e2e/utils/utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

function randomNumber(minimum: number, maximum: number): number {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

describe('Build Details', () => {
  let originalTimeout: number;
  before(() => login().then(() => browser.waitForAngularEnabled(false)));
  after(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should restart existing build', () => {
    return browser.get('/build/1')
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => browser.wait(() => element(by.css(`[name="restart-build"]`)).isPresent()))
      .then((): any => element(by.css(`[name="restart-build"]`)).click())
      .then((): any => element.all(by.css('.list-item')).count())
      .then(num => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === num;
      })))
      .then(() => delay(2000))
      .then(() => element.all(by.css(`[name="stop-job"]`)).each(el => el.click()))
      .then(num => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })));
  });

  it('should restart first job', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => {
        return browser
          .wait(() => element.all(by.css(`[name="restart-job"]`)).first().isPresent());
      })
      .then(() => delay(2000))
      .then((): any => element.all(by.css(`[name="restart-job"]`)).first().click())
      .then((): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 1));
      })
      .then((): any => {
        return browser.wait(() => element.all(by.css('.job-time')).then(els => els[0])
          .then(el => el.getAttribute('innerHTML').then(html => html === '00:05')));
      })
      .then((): any => {
        return browser
          .wait(() => element.all(by.css(`[name="stop-job"]`)).first().isPresent());
      })
      .then(() => delay(2000))
      .then((): any => element.all(by.css(`[name="stop-job"]`)).first().click())
      .then((num): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 0));
      });
  });

  it('should restart last job', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => {
        return browser
          .wait(() => element.all(by.css(`[name="restart-job"]`)).last().isPresent());
      })
      .then(() => delay(2000))
      .then((): any => element.all(by.css(`[name="restart-job"]`)).last().click())
      .then((): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 1));
      })
      .then((): any => {
        return browser.wait(() => element.all(by.css('.job-time')).then(els => els[els.length - 1])
          .then(el => el.getAttribute('innerHTML').then(html => html === '00:05')));
      })
      .then((): any => {
        return browser
          .wait(() => element.all(by.css(`[name="stop-job"]`)).last().isPresent());
      })
      .then(() => delay(2000))
      .then((): any => element.all(by.css(`[name="stop-job"]`)).last().click())
      .then((num): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 0));
      });
  });

  it('should restart random job', () => {
    let num = null;
    return Promise.resolve()
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => element.all(by.css('.list-item')).count())
      .then(numJobs => num = randomNumber(0, numJobs - 1))
      .then((): any => {
        return browser.wait(() => {
          return element.all(by.css(`[name="restart-job"]`)).then(els => els[num])
            .then(el => el.isPresent());
        });
      })
      .then(() => delay(2000))
      .then((): any => {
        return element.all(by.css(`[name="restart-job"]`))
          .then(els => els[num])
          .then(el => el.click());
      })
      .then((): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 1));
      })
      .then((): any => {
        return browser.wait(() => element.all(by.css('.job-time')).then(els => els[num])
          .then(el => el.getAttribute('innerHTML').then(html => html === '00:05')));
      })
      .then((): any => {
        return browser.wait(() => {
          return element.all(by.css(`[name="stop-job"]`)).then(els => els[num])
            .then(el => el.isPresent());
        });
      })
      .then(() => delay(2000))
      .then((): any => {
        return element.all(by.css(`[name="stop-job"]`)).then(els => els[num])
          .then(el => el.click());
      })
      .then((num): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 0));
      });
  });

  xit('should start new build (D3) and see progress bar in second job run', () => {
    return Promise.resolve()
      .then(() => browser.get('/'))
      .then(() => sendGitHubRequest(requestD3, header))
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 5;
      })))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.is-running')).count().then(count => count === 1);
      }))
      .then(() => element.all(by.css('.list-item')).then(els => els[0]).then(el => el.click()))
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt === 1;
      })))
      .then(() => element.all(by.css('.list-item')).then(els => els[0]).then(el => el.click()))
      .then((): any => {
        return browser.wait(() => element.all(by.css('.yellow')).count()
          .then(cnt => cnt === 1));
      })
      .then((): any => element.all(by.css('.progress-bar')).count())
      .then(progress => progress === 0)
      .then((): any => browser.wait(() => element(by.css(`[name="btn-restart"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-restart"]`)));
      }))
      .then(() => browser.wait(
        ExpectedConditions.presenceOf(element(by.css(`[name="btn-restart"]`)))))
      .then(() => delay(1000))
      .then((): any => element(by.css(`[name="btn-restart"]`)).click())
      .then((): any => browser.wait(() => {
        return element.all(by.css('.progress-bar')).count().then(cnt => cnt === 1);
      }))
      .then((): any => {
        return browser.wait(() => element(by.css('.progress-bar')).getAttribute('value')
          .then(value => parseFloat(value) < 0.2));
      })
      .then((): any => {
        return browser.wait(() => element(by.css('.progress-bar')).getAttribute('value')
          .then(value => parseFloat(value) > 0.4));
      })
      .then((): any => browser.getCurrentUrl())
      .then(url => browser.get(url))
      .then((): any => browser.wait(() => {
        return element.all(by.css('.progress-bar')).count().then(cnt => cnt === 1);
      }))
      .then((): any => {
        return browser.wait(() => element(by.css('.progress-bar')).getAttribute('value')
          .then(value => parseFloat(value) > 0.5));
      })
      .then((): any => browser.wait(() => element(by.css(`[name="btn-stop"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="btn-stop"]`)));
      }))
      .then(() => browser.wait(
        ExpectedConditions.presenceOf(element(by.css(`[name="btn-stop"]`)))))
      .then(() => delay(1000))
      .then((): any => element(by.css(`[name="btn-stop"]`)).click())
      .then((num): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 0));
      });
  });

  xit(`should restart first build and see approximately time remaining`, () => {
    return browser.get('/build/1')
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => browser.wait(() => element(by.css(`[name="restart-build"]`)).isPresent()))
      .then((): any => browser.wait(() => {
        return ExpectedConditions.elementToBeClickable(element(by.css(`[name="restart-build"]`)));
      }))
      .then((): any => element(by.css(`[name="restart-build"]`)).click())
      .then((): any => {
        return browser.wait(() => {
          return element.all(by.css(`[name="approximately-remainig-time"]`)).count()
            .then(cnt => cnt === 1);
        });
      })
      .then((): any => browser.getCurrentUrl())
      .then(url => browser.get(url))
      .then((): any => {
        return browser.wait(() => {
          return element.all(by.css(`[name="approximately-remainig-time"]`)).count()
            .then(cnt => cnt === 1);
        });
      })
      .then((): any => browser.wait(() => element(by.css(`[name="stop-build"]`)).isPresent()))
      .then(() => browser.wait(
        ExpectedConditions.presenceOf(element(by.css(`[name="stop-build"]`)))))
      .then(() => delay(1000))
      .then((): any => element(by.css(`[name="stop-build"]`)).click());
  });
});