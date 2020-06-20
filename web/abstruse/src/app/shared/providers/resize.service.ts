import { Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Subject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResizeService {
  get onResize$(): Observable<Window> {
    return this.resizeSubject.asObservable().pipe(share());
  }

  private resizeSubject: Subject<Window>;

  constructor(private eventManager: EventManager) {
    this.resizeSubject = new Subject();
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
  }

  private onResize(event: UIEvent) {
    this.resizeSubject.next(event.target as Window);
  }
}
