import * as docker from './docker';
import { readDir, exists } from './fs';
import { getFilePath } from './setup';
import { Observable, Observer } from 'rxjs';

interface DockerImage {
  repository: string;
  id?: string;
  created?: number;
  tag?: string;
  size?: number;
  ready?: boolean;
}

// buildImage('ubuntu_18_04', '/Users/jan/abstruse/docker/base-images/ubuntu_18_04')
//   .subscribe(event => {
//     console.log(event);
//   }, err => console.error(err), () => {
//     console.log('Done.');
//   });

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

export function getBaseImages(): Promise<any> {
  let listedImages: any[] = [];
  let imgs: DockerImage[] = [];

  return docker.listImages()
    .then(images => listedImages = images)
    .then(() => readDir(getFilePath('docker/base-images')))
    .then(images => {
      imgs = images.map(repository => ({ repository }));
      imgs = imgs.map(image => {
        const index = listedImages.
          findIndex(li => li.RepoTags[0].split(':')[0] === image.repository);

        if (index !== -1) {
          const li = listedImages[index];
          image.id = li.Id.split(':')[1];
          image.tag = li.RepoTags[0].split(':')[1];
          image.size = li.Size;
          image.created = li.Created;
          image.ready = true;
        } else {
          image.ready = false;
        }
        return image;
      });

      return imgs;
    });
}
