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

export const imageBuilder: Subject<ImageBuildOutput> = new Subject();
imageBuilder.share();

export function buildDockerImage(data: ImageData): void {
  prepareDirectory(data).then(() => {
    const folderPath = getFilePath(`images/${data.name}`);
    const src = glob.sync(folderPath + '/**/*').map(filePath => filePath.split('/').pop());

    let msg: LogMessageType = {
      message: `starting image build ${data.name}`,
      type: 'info',
      notify: false
    };
    logger.next(msg);

    docker.buildImage({ context: folderPath, src: src }, { t: data.name })
      .then(output => {
        output.on('data', d => {
          imageBuilder.next({ name: data.name, output: d.toString() });
        });
        output.on('finish', () => {
          msg.message = `image ${data.name} build successfully completed`;
          logger.next(msg);
        });
      })
      .catch(err => {
        msg.message = `error while building image ${data.name} (${err})`;
        msg.type = 'error';
        logger.next(msg);
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

