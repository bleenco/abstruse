import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Image, generateImage } from './image.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const imagesSubEvent = '/subs/images';

@Injectable({ providedIn: 'root' })
export class ImagesService {
  constructor(private http: HttpClient) {}

  find(): Observable<Image[]> {
    return this.http.get<Image[]>('/images').pipe(
      map(resp => (resp.length ? resp : [])),
      map(data => data.map(generateImage))
    );
  }

  sync(): Observable<void> {
    return this.http.put<void>('/images/sync', {});
  }

  build(data: { name: string; tags: string[]; dockerfile: string }): Observable<void> {
    return this.http.post<void>('/images/build', data);
  }
}
