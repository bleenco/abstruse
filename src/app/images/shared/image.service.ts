import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Image } from './image.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JSONResponse } from '../../core/shared/shared.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  tab: 'build images' | 'base images' = 'build images';
  loading: boolean;
  loadingBaseImages: boolean;
  buildingImages: Image[] = [];
  baseImages: Image[] = [];
  detailsDialogOpened: boolean;
  detailsImage: Image;
  logData: any;
  buildImages: Image[] = [];
  loadingBuildImages: boolean;
  createDialogOpened: boolean;

  constructor(public http: HttpClient) { }

  switchTab(tab: 'build images' | 'base images'): void {
    if (this.tab === tab) {
      return;
    }

    this.tab = tab;

    if (this.tab === 'base images') {
      this.fetchBaseImages();
    } else if (this.tab === 'build images') {
      this.fetchBuildImages();
    }
  }

  fetchBaseImages(): void {
    this.baseImages = [];
    this.loadingBaseImages = true;
    const url = getAPIURL() + `/images/base`;

    this.getBaseImages()
      .subscribe(resp => {
        if (resp && resp.data) {
          this.baseImages = resp.data.map(image => {
            return new Image(
              image.repository,
              image.ready,
              image.id || null,
              image.created || null,
              image.tag || '',
              image.size || null,
              image.buildLog || ''
            );
          });

          this.buildingImages.forEach(image => {
            this.baseImages = this.baseImages.map(baseImage => {
              if (baseImage.repository === image.repository) {
                baseImage.building = true;
              }
              return baseImage;
            });
          });

          if (this.detailsImage) {
            const image = this.baseImages.find(img => img.repository === this.detailsImage.repository);
            if (image) {
              this.detailsImage = image;
            }
          }
        }

        this.loadingBaseImages = false;
      });
  }

  fetchBuildImages(): void {
    this.buildImages = [];
    this.loadingBuildImages = true;
    const url = getAPIURL() + `/images/build`;

    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('/images/build'))
      )
      .subscribe(resp => {
        if (resp && resp.data) {
          this.buildImages = resp.data.map(image => {
            return new Image(
              image.repository,
              image.ready,
              image.id || null,
              image.created || null,
              image.tag || '',
              image.size || null,
              image.buildLog || ''
            );
          });

          this.buildingImages.forEach(image => {
            this.buildImages = this.buildImages.map(buildImage => {
              if (buildImage.repository === image.repository && buildImage.tag === image.tag) {
                buildImage.building = true;
              }
              return buildImage;
            });
          });

          if (this.detailsImage) {
            const image = this.buildImages.find(img => {
              return img.repository === this.detailsImage.repository && img.tag === this.detailsImage.tag;
            });
            if (image) {
              this.detailsImage = image;
            }
          }
        }

        this.loadingBuildImages = false;
      });
  }

  createImage(form: Image): Observable<JSONResponse> {
    const url = getAPIURL() + `/images/build`;
    const data = {
      repository: form.repository,
      tag: form.tag,
      dockerfile: form.dockerfile,
      initsh: form.initsh
    };

    return this.http.post<JSONResponse>(url, data)
      .pipe(
        catchError(handleError<JSONResponse>('/images/build'))
      );
  }

  buildImage(imageName: string, base = false): void {
    imageName = imageName.includes(':') ? imageName : imageName + ':latest';
    const params = { imageName };
    const url = base ? getAPIURL() + `/images/base` : getAPIURL() + `/images/build`;

    this.http.post<JSONResponse>(url, params)
      .subscribe(resp => {
        const splitted = imageName.split(':');
        if (base) {
          const index = this.baseImages.findIndex(img => img.repository === splitted[0]);
          if (index >= 0) {
            this.baseImages[index].buildLog = '';
          }
        }
      });
  }

  openDetailsDialog(repository: string, tag: string, base = false): void {
    this.logData = { clear: true };

    if (base) {
      const index = this.baseImages.findIndex(baseImage => baseImage.repository === repository);
      this.detailsImage = this.baseImages[index];
    } else {
      const index = this.buildImages.findIndex(buildImage => buildImage.repository === repository && buildImage.tag === tag);
      this.detailsImage = this.buildImages[index];
    }

    this.logData = this.detailsImage.buildLog.split('\n').join('\r\n');
    this.detailsDialogOpened = true;
  }

  closeDetailsDialog(): void {
    this.detailsImage = null;
    this.logData = { clear: true };
    this.detailsDialogOpened = false;
  }

  getBaseImageIndex(image: Image): number {
    return this.baseImages.findIndex(img => img.repository === image.repository);
  }

  getBuildImageIndex(image: Image): number {
    return this.buildImages.findIndex(img => img.repository === image.repository && img.tag === image.tag);
  }

  openCreateDialog(): void {
    this.createDialogOpened = true;
  }

  closeCreateDialog(): void {
    this.createDialogOpened = false;
  }

  getBaseImages(): Observable<JSONResponse> {
    const url = getAPIURL() + `/images/base`;

    return this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('/images/base'))
      );
  }
}
