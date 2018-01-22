import { Observable, Observer } from 'rxjs';
import { s3Deploy } from './deploy/aws-s3';
import { codeDeploy } from './deploy/aws-code-deploy';
import { elasticDeploy } from './deploy/aws-elastic';
import * as envVars from './env-variables';

export function deploy(
  preferences: any, container: string, variables: envVars.EnvVariables
): Observable<any> {
  return new Observable((observer: Observer<any>) => {
    if (preferences) {
      const provider = preferences.provider;
      deployProvider(provider, preferences, container, variables).subscribe(event => {
        observer.next(event);
      }, err => observer.error(err), () => observer.complete());
    } else {
      observer.complete();
    }
  });
}

function deployProvider(
  provider: string, preferences: any, container: string, variables: envVars.EnvVariables
): Observable<any> {
  switch (provider) {
    case 's3':
      return s3Deploy(preferences, container, variables);
    case 'codeDeploy':
      return codeDeploy(preferences, container, variables);
    case 'elastic':
      return elasticDeploy(preferences, container, variables);
    default:
      return new Observable((observer: Observer<any>) => {
        observer.error({
          type: 'containerError',
          data: `Deployment provider ${provider} is not supported.`
        });
        observer.complete();
      });
  }
}

export function findFromEnvVariables(variables: envVars.EnvVariables, property: string) {
  let value = variables[property];
  if (typeof value !== 'undefined') {
    return value.value;
  }

  return null;
}
