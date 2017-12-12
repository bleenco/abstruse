import { Observable, Observer } from 'rxjs';
import { s3Deploy } from './deploy/aws-s3';
import { codeDeploy } from './deploy/aws-code-deploy';
import { elasticDeploy } from './deploy/aws-elastic';

export function deploy(preferences: any, container: string, variables: string[]): Observable<any> {
  return new Observable((observer: Observer<any>) => {
    if (preferences) {
      const provider = preferences.provider;
      deployProvider(provider, preferences, container, variables).subscribe(event => {
        observer.next(event);
      },
      err => observer.error(err),
      () => observer.complete());
    } else {
      observer.complete();
    }
  });
}

function deployProvider(provider, preferences, container, variables): Observable<any> {
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

export function findFromEnvVariables(variables, property) {
  let value = variables.find(v => v.startsWith(property));

  if (value) {
    const tmp = value.split('=');
    if (tmp.length > 1) {
      return tmp[1];
    }
  }

  return null;
}
