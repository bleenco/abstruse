import { ComponentRef } from '@angular/core';
import { ContentRef } from './content-ref.class';
import { ModalComponent } from './modal.component';

export class ActiveModal {
  close(result?: any): void {}
  dismiss(reason?: any): void {}
}

export class ModalRef<T = any> {
  private resolve!: (result?: any) => void;
  private reject!: (reason?: any) => void;
  private body: HTMLBodyElement;

  get componentInstance(): any {
    if (this.contentRef && this.contentRef.componentRef) {
      return this.contentRef.componentRef.instance;
    }
  }

  result: Promise<any>;

  constructor(
    private windowComponentRef: ComponentRef<ModalComponent> | null,
    private contentRef: ContentRef | null,
    private beforeDismiss?: () => boolean | Promise<boolean>
  ) {
    this.windowComponentRef?.instance.dismissEvent.subscribe((reason: any) => this.dismiss(reason));
    this.result = new Promise(
      (resolve, reject) => ([this.resolve, this.reject] = [resolve, reject])
    );
    this.result.then(null, () => {});
    this.body = document.querySelector('body') as HTMLBodyElement;
  }

  close(result?: any): void {
    if (!this.windowComponentRef) {
      return;
    }

    this.resolve(result);
    this.removeModalElements();
    this.enableBodyScroll();
  }

  dismiss(reason?: any): void {
    if (!this.windowComponentRef) {
      return;
    }

    this.enableBodyScroll();
    if (!this.beforeDismiss) {
      this.doDismiss(reason);
    } else {
      const dismiss = this.beforeDismiss();
      if (dismiss && dismiss instanceof Promise) {
        dismiss.then(result => (result !== false ? this.doDismiss(reason) : false));
      } else if (dismiss !== false) {
        this.doDismiss(reason);
      }
    }
  }

  private enableBodyScroll(): void {
    this.body.classList.remove('no-scroll');
  }

  private doDismiss(reason?: any): void {
    this.reject(reason);
    this.removeModalElements();
  }

  private removeModalElements(): void {
    const windowNativeEl = this.windowComponentRef?.location.nativeElement;
    windowNativeEl.parentNode.removeChild(windowNativeEl);
    this.windowComponentRef?.destroy();

    if (this.contentRef && this.contentRef.viewRef) {
      this.contentRef.viewRef.destroy();
    }

    [this.windowComponentRef, this.contentRef] = [null, null];
  }
}
