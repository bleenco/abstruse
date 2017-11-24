import { docker } from './docker';
import { getHumanSize } from './utils';
import { getFilePath } from './setup';
import * as fs from 'fs-extra';
import { logger, LogMessageType } from './logger';
import { join } from 'path';
import { Observable, Subject } from 'rxjs';
import * as glob from 'glob';
import { format, distanceInWordsToNow } from 'date-fns';

export interface ImageData {
  name: string;
  dockerfile: string;
  initsh: string;
  base: boolean;
}

export interface ImageBuildOutput {
  name: string;
  output: any;
}

export const imageBuilder: Subject<ImageBuildOutput> = new Subject();
export const imageBuilderObs = imageBuilder.share();

export function buildAbstruseBaseImage(): void {
  buildDockerImage(defaultBaseImage);
}

export function buildDockerImage(data: ImageData): void {
  prepareDirectory(data).then(() => {
    const folderPath =
      data.base ? getFilePath(`base-images/${data.name}`) : getFilePath(`images/${data.name}`);
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
          msg = {
            message: `image ${data.name} build successfully completed`,
            type: 'info',
            notify: false
          };
          logger.next(msg);
        });
        output.on('error', () => {
          msg = {
            message: `error while building image ${data.name}`,
            type: 'error',
            notify: true
          };
          logger.next(msg);
        });
        output.on('end', () => {
          msg = {
            message: `image ${data.name} build successfully completed`,
            type: 'info',
            notify: false
          };
          logger.next(msg);
        });
      })
      .catch(err => {
        msg = {
          message: `error while building image ${data.name} (${err})`,
          type: 'error',
          notify: true
        };
        logger.next(msg);
      });
  });
}

export function deleteImage(data: ImageData): void {
  let msg: LogMessageType = {
    message: `starting image delete ${data.name}`,
    type: 'info',
    notify: false
  };
  logger.next(msg);

  try {
    docker.getImage(data.name).remove({ force: true }, () => {
      const folderPath =
        data.base ? getFilePath(`base-images/${data.name}`) : getFilePath(`images/${data.name}`);
      fs.remove(folderPath);

      msg = {
        message: `Image ${data.name} successfully deleted`,
        type: 'info',
        notify: false
      };
      logger.next(msg);
    });
  } catch {
    msg = {
      message: `error removeing docker image ${data.name}`,
      type: 'error',
      notify: false
    };
    logger.next(msg);
  }
}

function prepareDirectory(data: ImageData): Promise<void> {
  const folderPath =
    data.base ? getFilePath(`base-images/${data.name}`) : getFilePath(`images/${data.name}`);
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

export function getImages(): Promise<any> {
  return new Promise((resolve, reject) => {
    Promise.all([getImagesInDirectory('images'), getImagesInDirectory('base-images')])
      .then(imgs => resolve(imgs.reduce((a, b) => a.concat(b))));
  });
}


function getImagesInDirectory(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const imagesDir = getFilePath(path);

    fs.readdir(imagesDir).then(dirs => {
      docker.listImages()
        .then(images => {
          let imgs = dirs.map(d => {
            let index = images.findIndex(i => {
              if (i.RepoTags) {
                return i.RepoTags.findIndex(t => t.startsWith(d)) !== -1;
              }

              return false;
            });
            if (index !== -1) {
              return {
                name: d,
                version: images[index].RepoTags.find(t => t.startsWith(d)).split(':')[1],
                created: format(new Date(images[index].Created * 1000), 'DD.MM.YYYY HH:mm:ss'),
                createdAgo: distanceInWordsToNow(new Date(images[index].Created * 1000)),
                size: getHumanSize(images[index].Size),
                dockerfile: null,
                initsh: null
              };
            } else {
              return null;
            }
          }).filter(Boolean);

          Promise.all(imgs.map(img => {
            const dockerfile = getFilePath(`${path}/${img.name}/Dockerfile`);
            const initsh = getFilePath(`${path}/${img.name}/init.sh`);

            if (fs.existsSync(dockerfile) && fs.existsSync(initsh)) {
              return fs.readFile(dockerfile)
                .then(dockerfileContents => {
                  return fs.readFile(initsh).then(initshContents => {
                    img.dockerfile = dockerfileContents.toString();
                    img.initsh = initshContents.toString();
                    img.base = path === 'base-images';

                    return img;
                  });
                });
            } else {
              return Promise.resolve(img);
            }
          }))
          .then(imgs => resolve(imgs))
          .catch(err => reject(err));
        });
    });
  });
}

let defaultBaseImage: ImageData = {
  name: 'abstruse_builder',
  dockerfile: [
    'FROM ubuntu:17.10',
    '',
    'ENV DEBIAN_FRONTEND=noninteractive',
    '',
    '# please do not edit between lines or image on abstruse will not work properly',
    '',
    '# -------------------------------------------------------------------------------------------',
    '',
    'RUN set -xe \\',
    '    && apt-get update \\',
    '    && apt-get install -y --no-install-recommends ca-certificates curl build-essential \\',
    '    && apt-get install -y --no-install-recommends libssl-dev git python \\',
    '    && apt-get install -y --no-install-recommends sudo \\',
    '    && apt-get install -y --no-install-recommends xvfb x11vnc fluxbox xterm openssh-server',
    '',
    'RUN useradd -u 1000 -g 100 -G sudo --shell /bin/bash -m --home-dir /home/abstruse abstruse \\',
    '    && echo \'abstruse ALL=(ALL) NOPASSWD:ALL\' >> /etc/sudoers \\',
    '    && echo \'abstruse:abstrusePass\' | chpasswd',
    '',
    'COPY fluxbox /etc/init.d/',
    'COPY x11vnc /etc/init.d/',
    'COPY xvfb /etc/init.d/',
    'COPY entry.sh /',
    '',
    'COPY abstruse-pty /usr/bin/abstruse-pty',
    'COPY abstruse-exec.sh /usr/bin/abstruse',
    '',
    'USER abstruse',
    'WORKDIR /home/abstruse/build',
    '',
    'RUN cd /home/abstruse && sudo chown -Rv 1000:100 /home/abstruse',
    '',
    'RUN sudo chmod +x /entry.sh /etc/init.d/* /usr/bin/abstruse*',
    'CMD ["/entry.sh"]',
    '',
    'EXPOSE 22 5900'
  ].join('\n'),
  initsh: '',
  base: true
};
