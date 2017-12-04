import { Observable, Observer } from 'rxjs';
import { attachExec } from '../docker';
import { CommandType } from '../config';
import { findFromEnvVariables } from '../deploy';
import * as style from 'ansi-styles';
import chalk from 'chalk';

export function s3Deploy(
  preferences: any, container: string, variables: string[]
): Observable<any> {
  return new Observable((observer: Observer<any>) => {

    // 1. check preferences
    const bucket = preferences.bucket;
    let accessKeyId = findFromEnvVariables(variables, 'accessKeyId');
    let secretAccessKey = findFromEnvVariables(variables, 'secretAccessKey');
    let region = findFromEnvVariables(variables, 'region');
    let errors = false;

    if (!bucket) {
      const msg = chalk.red('bucket is not set in yml config file \r\n');
      observer.next({ type: 'data', data: msg});
      errors = true;
    }

    if (!accessKeyId) {
      if (preferences && preferences.accessKeyId) {
        accessKeyId = preferences.accessKeyId;
      } else {
        const msg = chalk.red('accessKeyId is not set in environment '
          + 'variables or in yml config \r\n');
        observer.next({ type: 'data', data: msg});
        errors = true;
      }
    }

    if (!secretAccessKey) {
      if (preferences && preferences.secretAccessKey) {
        secretAccessKey = preferences.secretAccessKey;
      } else {
        const msg = chalk.red('secretAccessKey is not set in environment variables or'
          + ' in yml config \r\n');
        observer.next({ type: 'data', data: msg});
        errors = true;
      }
    }

    if (!region) {
      if (preferences && preferences.region) {
        region = preferences.region;
      } else {
        const msg =
          chalk.red('region is not set in environment variables or in yml config file \r\n');
        observer.next({ type: 'data', data: msg});
        errors = true;
      }
    }

    if (!errors) {
      let msg = style.yellow.open + style.bold.open + '==> deploy started' +
      style.bold.close + style.yellow.close + '\r\n';
      observer.next({ type: 'data', data: msg });

      // 2. check if appspec.yml exists (otherwise create it)
      appSpecExists(container).then(exists => {
        let commands = [];
        if (!exists) {
          commands.push(
            { type: CommandType.deploy, command: `echo version: 0.0 >> appspec.yml` },
            { type: CommandType.deploy, command: `echo os: linux >> appspec.yml` },
            { type: CommandType.deploy, command: `echo files: >> appspec.yml` },
            { type: CommandType.deploy, command: `echo '  - source: ./' >> appspec.yml` },
            { type: CommandType.deploy, command: `echo '    destination: ./' >> appspec.yml` }
          );
        }

        return Observable
          .concat(...commands.map(command => attachExec(container, command)))
          .toPromise();
      })
      .then(result => {
        if (!(result && result.data === 0)) {
          const msg = `creating appspec.yml failed`;
          observer.next({ type: 'containerError', data: msg});
          return Promise.reject(-1);
        }

        // 3. install awscli and set credentials
        let command = { type: CommandType.deploy, command: 'sudo apt-get install awscli -y' };

        return attachExec(container, command).toPromise();
      })
      .then(result => {
        if (!(result && result.data === 0)) {
          const msg = `apt-get install awscli failed`;
          observer.next({ type: 'containerError', data: msg});
          return Promise.reject(-1);
        }

        let command = {
          type: CommandType.deploy,
          command: `aws configure set aws_access_key_id ${accessKeyId}`
        };

        return attachExec(container, command).toPromise();
      })
      .then(result => {
        if (!(result && result.data === 0)) {
          const msg = 'aws configure aws_access_key_id failed';
          observer.next({ type: 'containerError', data: msg});
          return Promise.reject(-1);
        }

        let command = {
          type: CommandType.deploy,
          command: `aws configure set aws_secret_access_key ${secretAccessKey}`
        };

        return attachExec(container, command).toPromise();
      })
      .then(result => {
        if (!(result && result.data === 0)) {
          const msg = 'aws configure aws_secret_access_key failed';
          observer.next({ type: 'containerError', data: msg});
          return Promise.reject(-1);
        }

        let command = {
          type: CommandType.deploy, command: `aws configure set region ${region}`
        };

        return attachExec(container, command).toPromise();
      })
      .then(result => {
        if (!(result && result.data === 0)) {
          const msg = 'aws configure region failed';
          observer.next({ type: 'containerError', data: msg});
          return Promise.reject(-1);
        }

        // 4. check if application allready exists (otherwise create it)
        return applicationExists(container, preferences.bucket);
      })
      .then(exists => {
        let application = [
          { type: CommandType.deploy, command: `aws s3 mb s3://${preferences.bucket}` }
        ];

        if (!exists) {
          let cmd = `aws deploy create-application --application-name ${preferences.bucket}`;
          application.push( { type: CommandType.deploy, command: cmd } );
        }

        return Observable
          .concat(...application.map(command => attachExec(container, command)))
          .toPromise();
      })
      .then(result => {
        if (!(result && result.data === 0)) {
          const msg = `aws deploy failed`;
          observer.next({ type: 'containerError', data: msg});
          return Promise.reject(-1);
        }

        // 5. deploy
        const zipName = preferences.bucket;
        const deploy = {
          type: CommandType.deploy,
          command: `aws deploy push --application-name ${preferences.bucket}`
            + ` --s3-location s3://${preferences.bucket}/${zipName}.zip`
        };

        return attachExec(container, deploy).toPromise();
      })
      .then(result => {
        if (!(result && result.data === 0)) {
          const msg = `aws deploy push failed`;
          observer.next({ type: 'containerError', data: msg});
          return Promise.reject(-1);
        }

        let msg = style.yellow.open + style.bold.open + '==> deployment completed successfully!'
          + style.bold.close + style.yellow.close + '\r\n';
        observer.next({ type: 'data', data: msg });
        observer.complete();
      })
      .catch(err => {
        observer.error(err);
        observer.complete();
      });
    } else {
      observer.error(-1);
      observer.complete();
    }
  });
}

function appSpecExists(container): Promise<any> {
  return new Promise((resolve, reject) => {
    let appSpec = false;
    attachExec(container, { type: CommandType.deploy, command: 'ls'})
      .subscribe(event => {
        if (event && event.data) {
          if (String(event.data).indexOf('appspec.yml') != -1) {
            appSpec = true;
          }
        }
      },
      err => reject(err),
      () => resolve(appSpec));
  });
}

function applicationExists(container, application): Promise<any> {
  return new Promise((resolve, reject) => {
    const getApplicationCommand = 'aws deploy list-applications';
    let appExists = false;
    attachExec(container, { type: CommandType.deploy, command: getApplicationCommand })
    .subscribe(event => {
      if (event && event.data) {
        if (String(event.data).indexOf(application) != -1) {
          appExists = true;
        }
      }
    },
    err => reject(err),
    () => resolve(appExists));
  });
}
