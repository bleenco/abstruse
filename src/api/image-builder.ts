import { docker } from './docker';
import { getFilePath } from './utils';
import * as fs from 'fs-extra';
import { logger, LogMessageType } from './logger';
import { join } from 'path';
import { Observable, Subject } from 'rxjs';
import * as glob from 'glob';

export interface ImageData {
  name: string;
  dockerfile: string;
  initsh: string;
}

export interface ImageBuildOutput {
  name: string;
  output: any;
}

export function buildDockerImage(data: ImageData): Observable<ImageBuildOutput> {
  return new Observable(observer => {
    prepareDirectory(data).then(() => {
      const folderPath = getFilePath(`images/${data.name}`);
      const src = glob.sync(folderPath + '/**/*').map(filePath => filePath.split('/').pop());

      docker.buildImage({ context: folderPath, src: src }, { t: data.name })
        .then(output => {
          output.on('data', d => observer.next({ name: data.name, output: d.toString() }));
          output.on('finish', () => observer.complete());
        })
        .catch(err => {
          observer.error(err);
          observer.complete();
        });
    });
  });
}

function prepareDirectory(data: ImageData): Promise<void> {
  const folderPath = getFilePath(`images/${data.name}`);
  const dockerFilePath = join(folderPath, 'Dockerfile');
  const initShFilePath = join(folderPath, 'init.sh');
  const essentialFolderPath = getFilePath(`docker-essential`);

  return fs.remove(folderPath)
    .then(() => fs.ensureDir(folderPath))
    .then(() => fs.copy(essentialFolderPath, folderPath))
    .then(() => fs.writeFile(dockerFilePath, data.dockerfile, 'utf8'))
    .then(() => fs.writeFile(initShFilePath, data.initsh, 'utf8'))
    .catch(err => {
      const msg: LogMessageType = {
        message: `error preparing ${folderPath} for docker image build`,
        type: 'error',
        notify: false
      };
      logger.next(msg);
    });
}

