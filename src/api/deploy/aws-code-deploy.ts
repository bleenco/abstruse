import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { dockerExec } from '../docker';
import { CommandType } from '../config';
import { findFromEnvVariables } from '../deploy';
import * as style from 'ansi-styles';
import { error } from 'util';
import chalk from 'chalk';
import * as envVars from '../env-variables';

export function codeDeploy(
  preferences: any, container: string, variables: envVars.EnvVariables
): Observable<any> {
  return new Observable((observer: Observer<any>) => {

    // 1. check preferences
    const application = preferences.application;
    const applicationRevision = preferences.applicationRevision;
    const deployGroup = preferences.deploymentGroup;
    const arn = findFromEnvVariables(variables, 'arn') || preferences.arn;
    let applicationStore = preferences.applicationStore;
    let applicationType = preferences.applicationType;
    let applicationFileName = preferences.applicationFile;
    let accessKeyId = findFromEnvVariables(variables, 'accessKeyId');
    let secretAccessKey = findFromEnvVariables(variables, 'secretAccessKey');
    let region = findFromEnvVariables(variables, 'region');
    let errors = false;

    if (!application) {
      const msg = chalk.red('application is not set in yml config file \r\n');
      observer.next({ type: 'data', data: msg });
      errors = true;
    }

    if (!applicationStore) {
      applicationStore = 's3';
    }

    if (!applicationType) {
      applicationType = 'zip';
    }

    if (!applicationFileName) {
      applicationFileName = `${application}.${applicationType}`;
    }

    if (!deployGroup) {
      const msg = chalk.red('deploymentGroup is not set in yml config file \r\n');
      observer.next({ type: 'data', data: msg });
      errors = true;
    }

    if (!accessKeyId) {
      if (preferences && preferences.accessKeyId) {
        accessKeyId = preferences.accessKeyId;
      } else {
        const msg = chalk.red('accessKeyId is not set in environment '
          + 'variables or in yml config \r\n');
        observer.next({ type: 'data', data: msg });
        errors = true;
      }
    }

    if (!secretAccessKey) {
      if (preferences && preferences.secretAccessKey) {
        secretAccessKey = preferences.secretAccessKey;
      } else {
        const msg = chalk.red('secretAccessKey is not set in environment variables or'
          + ' in yml config \r\n');
        observer.next({ type: 'data', data: msg });
        errors = true;
      }
    }

    if (!region) {
      if (preferences && preferences.region) {
        region = preferences.region;
      } else {
        const msg = chalk.red('region is not set in environment variables or in yml config \r\n');
        observer.next({ type: 'data', data: msg });
        errors = true;
      }
    }

    if (!errors) {
      const msg = style.yellow.open + style.bold.open + '==> deploy started' +
        style.bold.close + style.yellow.close + '\r\n';
      observer.next({ type: 'data', data: msg });

      // 2. set credentials for awscli
      let command = {
        type: CommandType.deploy, command: `aws configure set aws_access_key_id ${accessKeyId}`
      };
      dockerExec(container, command, variables)
        .toPromise()
        .then(result => {
          if (!(result && result.data === 0)) {
            const m = 'aws configure aws_access_key_id failed';
            observer.next({ type: 'containerError', data: m });
            return Promise.reject(1);
          }

          command = {
            type: CommandType.deploy,
            command: `aws configure set aws_secret_access_key ${secretAccessKey}`
          };

          return dockerExec(container, command, variables).toPromise();
        })
        .then(result => {
          if (!(result && result.data === 0)) {
            const m = 'aws configure aws_secret_access_key failed';
            observer.next({ type: 'containerError', data: m });
            return Promise.reject(1);
          }

          command = {
            type: CommandType.deploy, command: `aws configure set region ${region}`
          };

          return dockerExec(container, command, variables).toPromise();
        })
        .then(result => {
          if (!(result && result.data === 0)) {
            const m = 'aws configure region failed';
            observer.next({ type: 'containerError', data: m });
            return Promise.reject(1);
          }

          // 3. check if deployment-group exists (otherwise create it)
          return depGroupExists(container, application, deployGroup);
        })
        .then(exists => {
          if (!exists) {
            if (arn) {
              command = {
                type: CommandType.deploy,
                command: `aws deploy create-deployment-group --application-name ${application}`
                  + ` --deployment-group-name ${deployGroup} --service-role-arn ${arn}`
              };

              return dockerExec(container, command, variables)
                .toPromise()
                .then(result => {
                  if (!(result && result.data === 0)) {
                    const m = 'create-deployment-group failed';
                    observer.next({ type: 'containerError', data: m });
                    return Promise.reject(1);
                  }

                  Promise.resolve();
                });
            } else {
              const m = `deployment group doesn't exists and arn parameter is empty`;
              observer.next({ type: 'containerError', data: m });
              return Promise.reject(1);
            }
          } else {
            Promise.resolve();
          }
        })
        .then(() => {
          // 4. create deployment
          let location = `bucket=${application},bundleType=${applicationType},`
            + `key=${applicationFileName}`;
          if (applicationRevision) {
            location += `,eTag=${applicationRevision}`;
          }

          command = {
            type: CommandType.deploy,
            command: `aws deploy create-deployment --application-name ${application}`
              + ` --deployment-group-name ${deployGroup}`
          };

          if (applicationStore === 's3') {
            command.command += ` --s3-location ${location}`;
          } else if (applicationStore === 'github') {
            command.command += ` --github-location ${location}`;
          } else {
            const m = 'ApplicationStore can only be s3 or github,'
              + ' other stores are not supported';
            observer.next({ type: 'containerError', data: m });
            return Promise.reject(1);
          }

          return dockerExec(container, command, variables)
            .toPromise()
            .then(result => {
              if (!(result && result.data === 0)) {
                const m = 'create-deployment failed';
                observer.next({ type: 'containerError', data: m });
                return Promise.reject(1);
              }

              Promise.resolve();
            });
        })
        .then(() => {
          const m = style.yellow.open + style.bold.open + '==> deployment completed successfully!'
            + style.bold.close + style.yellow.close + '\r\n';
          observer.next({ type: 'data', data: m });
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

function depGroupExists(container: string, application: string, group: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const command = `aws deploy get-deployment-group --application-name ${application}`
      + ` --deployment-group ${group}`;
    let groupExists = false;
    dockerExec(container, { type: CommandType.deploy, command: command })
      .subscribe(event => {
        if (event && event.type && event.type === 'exit') {
          if (event.data === 0) {
            groupExists = true;
          }
        }
      },
        err => reject(err),
        () => resolve(groupExists));
  });
}
