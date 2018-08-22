import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Image } from './image.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { catchError } from 'rxjs/operators';
import { JSONResponse } from '../../core/shared/shared.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  tab: 'build images' | 'base images' = 'build images';
  loading: boolean;
  loadingBaseImages: boolean;
  baseImages: Image[] = [];

  constructor(public http: HttpClient) { }

  switchTab(tab: 'build images' | 'base images'): void {
    if (this.tab === tab) {
      return;
    }

    this.tab = tab;

    if (this.tab === 'base images') {
      this.fetchBaseImages();
    }
  }

  fetchBaseImages(): void {
    this.baseImages = [];
    this.loadingBaseImages = true;
    const url = getAPIURL() + `/images/base`;

    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('/images/base'))
      )
      .subscribe(resp => {
        if (resp && resp.data) {
          this.baseImages = resp.data.map(image => {
            return new Image(
              image.repository,
              image.ready,
              image.id || null,
              image.created || null,
              image.tag || null,
              image.size || null
            );
          });
        }

        this.loadingBaseImages = false;
      });
  }
}
