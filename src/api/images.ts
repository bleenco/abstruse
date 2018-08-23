import * as docker from './docker';
import { readDir, exists, existsSync, ensureDirectory, writeFile } from './fs';
import { getFilePath } from './setup';
import { Observable, Observer, Subject, BehaviorSubject } from 'rxjs';
import { join } from 'path';
import { createWriteStream, readFileSync } from 'fs';
import { remove } from 'fs-extra';

interface DockerImage {
  repository: string;
  id?: string;
  created?: number;
  tag?: string;
  size?: number;
  ready?: boolean;
  building?: boolean;
  buildLog?: string;
}

export interface ImageBuildProgress {
  type: 'image building' | 'image done' | 'image error';
  data: { image: DockerImage, output: string };
}

let buildImages: DockerImage[] = [];

export const buildingImages = new BehaviorSubject<DockerImage[]>(buildImages);
export const imageProgress = new Subject<ImageBuildProgress>();

export function startImageBuild(imageName: string, filesPath: string): void {
  const repository = imageName.split(':')[0];
  const tag = imageName.split(':')[1] || 'latest';
  const building = true;
  const image: DockerImage = { repository, tag, building };
  const logFile = join(filesPath, 'log.txt');

  buildImages.push(image);
  buildingImages.next(buildImages);

  remove(logFile)
    .then(() => {
      const logStream = createWriteStream(logFile);
      logStream.on('open', () => {
        buildImage(imageName, filesPath).subscribe(ev => {
          try {
            const event = JSON.parse(ev);
            let output = event.stream || event.status || '';
            if (output.startsWith('Downloading') ||
              output.startsWith('Extracting') ||
              output.startsWith('Pulling') ||
              output.startsWith('Status: ') ||
              output.startsWith('Digest: ') ||
              output.startsWith('Pull complete') ||
              output.startsWith('Download complete') ||
              output.startsWith('Waiting')) {
              output = output + '\r\n';
            } else {
              output = output.split('\n').join('\r\n');
            }


            const progress: ImageBuildProgress = {
              type: 'image building',
              data: { image, output: output }
            };
            imageProgress.next(progress);
            logStream.write(output);
          } catch (err) { }
        }, err => {
          const progress: ImageBuildProgress = {
            type: 'image error',
            data: { image, output: err }
          };
          imageProgress.next(progress);

          buildImages = buildImages.filter(img => img !== image);
          buildingImages.next(buildImages);
          if (typeof err === 'string') {
            logStream.write(err);
          } else {
            logStream.write(JSON.stringify(err));
          }
        }, () => {
          const progress: ImageBuildProgress = {
            type: 'image done',
            data: { image, output: null }
          };
          imageProgress.next(progress);

          buildImages = buildImages.filter(img => img !== image);
          buildingImages.next(buildImages);
          logStream.end();
        });
      });
    });
}

export function createImage(
  data: { repository: string, tag: string, dockerfile: string, initsh: string }
): Promise<boolean> {
  const filePath = getFilePath(`docker/images/${data.repository}/${data.tag}`);
  const splitted = data.dockerfile.split(':');
  if (!splitted.find(line => line === 'COPY init.sh /home/abstruse/init.sh')) {
    splitted.push('\n\nCOPY init.sh /home/abstruse/init.sh\n\n');
    data.dockerfile = splitted.join('\n');
  }

  return ensureDirectory(filePath)
    .then(() => writeFile(join(filePath, 'init.sh'), data.initsh))
    .then(() => writeFile(join(filePath, 'Dockerfile'), data.dockerfile))
    .then(() => {
      const imageName = data.repository + ':' + data.tag;
      startImageBuild(imageName, filePath);
      return true;
    });
}

export function getBuildImages(): Promise<any> {
  let listedImages: any[] = [];
  const foundImages: DockerImage[] = [];

  return docker.listImages()
    .then(images => listedImages = images)
    .then(() => readDir(getFilePath('docker/images')))
    .then(images => {
      return Promise.all(
        images.map(curr => {
          return readDir(getFilePath('/docker/images/' + curr))
            .then(tags => {
              tags.forEach(tag => {
                let log = '';
                const logPath = getFilePath('/docker/images/' + curr + '/' + tag + '/log.txt');
                if (existsSync(logPath)) {
                  log = readFileSync(logPath, { encoding: 'utf8' }).toString();
                }

                listedImages.forEach(li => {
                  li.RepoTags.forEach(repoTag => {
                    const splitted = repoTag.split(':');
                    if (splitted[0] === curr && splitted[1] === tag) {
                      const image = {
                        repository: curr,
                        id: li.Id.split(':')[1],
                        tag: tag,
                        size: li.Size,
                        created: li.Created,
                        ready: true,
                        buildLog: log
                      };
                      foundImages.push(image);
                    }
                  });
                });

                if (!foundImages.find(img => img.repository === curr && img.tag === tag)) {
                  foundImages.push({ repository: curr, tag: tag, ready: false, buildLog: log });
                }
              });
            });
        })
      );
    })
    .then(() => foundImages);
}

export function getBaseImages(): Promise<any> {
  let listedImages: any[] = [];

  return docker.listImages()
    .then(images => listedImages = images)
    .then(() => readDir(getFilePath('docker/base-images')))
    .then(images => {
      return images.reduce((prev, curr) => {
        const logFile = getFilePath('docker/base-images/' + curr + '/log.txt');
        let log = '';
        if (existsSync(logFile)) {
          log = readFileSync(logFile, { encoding: 'utf8' }).toString();
        }

        let image: DockerImage;
        let listedImage = null;
        let index = null;
        listedImages.forEach(li => {
          if (!listedImage) {
            index = li.RepoTags.findIndex(tag => tag.split(':')[0] === curr);
            if (index !== -1) {
              listedImage = li;
            }
          }
        });

        if (listedImage) {
          image = {
            repository: curr,
            id: listedImage.Id.split(':')[1],
            tag: listedImage.RepoTags[index].split(':')[1],
            size: listedImage.Size,
            created: listedImage.Created,
            ready: true,
            buildLog: log
          };
        } else {
          image = { repository: curr, ready: false, buildLog: log };
        }

        return prev.concat(image);
      }, []);
    });
}

function buildImage(imageName: string, filesPath: string): Observable<string> {
  return new Observable((observer: Observer<string>) => {
    exists(filesPath)
      .then((doExists): any => {
        if (!doExists) {
          return Promise.reject(`image files dir does not exists`);
        } else {
          return readDir(filesPath);
        }
      })
      .then(files => docker.buildImage(imageName, filesPath, files))
      .then(stream => {
        stream.on('data', data => observer.next(data.toString()));
        stream.on('error', data => observer.error(data.toString()));
        stream.on('end', () => observer.complete());
      })
      .catch(err => {
        observer.error(err);
        observer.complete();
      });
  });
}
