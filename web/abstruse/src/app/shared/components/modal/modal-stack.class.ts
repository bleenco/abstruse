import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  ComponentRef,
  Injector,
  Inject,
  TemplateRef
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ModalRef, ActiveModal } from './modal-ref.class';
import { ModalOptions, ModalOption } from './modal-config.service';
import { ModalComponent } from './modal.component';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ContentRef } from './content-ref.class';

@Injectable({ providedIn: 'root' })
export class ModalStack {
  private modalRefs: ModalRef[] = [];
  private windowComponents: ComponentRef<ModalComponent>[] = [];
  private windowComponentChanged = new Subject();
  private modalOptions = [
    'backdrop',
    'backdropOpacity',
    'beforeDismiss',
    'container',
    'injector',
    'keyboard',
    'scrollable',
    'size'
  ];

  constructor(
    @Inject(DOCUMENT) private document: any,
    private applicationRef: ApplicationRef,
    private injector: Injector
  ) {
    this.windowComponentChanged.pipe(filter(() => !!this.windowComponents.length)).subscribe(() => {
      const activeWindowComponent = this.windowComponents[this.windowComponents.length - 1];
      this.setHidden(activeWindowComponent);
      this.setOpened(activeWindowComponent);
    });
  }

  open(
    moduleComponentFactoryResolver: ComponentFactoryResolver,
    contentInjector: Injector,
    content: any,
    options: ModalOptions
  ): ModalRef {
    const containerEl =
      options && options.container
        ? this.document.querySelector(options.container)
        : this.document.body;
    if (!containerEl) {
      throw new Error(
        `The specified modal container "${options.container || 'body'}" was not found in the DOM.`
      );
    }

    const activeModal = new ActiveModal();
    const contentRef = this.getContentRef(
      moduleComponentFactoryResolver,
      options.injector || contentInjector,
      content,
      activeModal
    );
    const windowComponentRef: ComponentRef<ModalComponent> = this.attachWindowComponent(
      moduleComponentFactoryResolver,
      containerEl,
      contentRef
    );
    const modalRef: ModalRef = new ModalRef(windowComponentRef, contentRef, options.beforeDismiss);
    const body = this.document.querySelector('body');

    this.registerModalRef(modalRef);
    this.registerWindowComponent(windowComponentRef);

    activeModal.close = (result?: any) => {
      modalRef.close(result);
    };
    activeModal.dismiss = (result?: any) => {
      modalRef.dismiss(result);
    };

    this.applyOptions(windowComponentRef.instance, options);
    body.classList.add('no-scroll');

    return modalRef;
  }

  dismissAll(reason?: any): void {
    this.modalRefs.forEach(modalRef => modalRef.dismiss(reason));
  }

  hasOpenModals(): boolean {
    return this.modalRefs.length > 0;
  }

  private getContentRef(
    moduleComponentFactoryResolver: ComponentFactoryResolver,
    contentInjector: Injector,
    content: any,
    activeModal: ActiveModal
  ): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      return this.createFromTemplateRef(content, activeModal);
    } else if (typeof content === 'string') {
      return this.createFromString(content);
    } else {
      return this.createFromComponent(
        moduleComponentFactoryResolver,
        contentInjector,
        content,
        activeModal
      );
    }
  }

  private attachWindowComponent(
    moduleComponentFactoryResolver: ComponentFactoryResolver,
    containerEl: any,
    contentRef: any
  ): ComponentRef<ModalComponent> {
    const windowFactory = moduleComponentFactoryResolver.resolveComponentFactory(ModalComponent);
    const windowComponentRef = windowFactory.create(this.injector, contentRef.nodes);
    this.applicationRef.attachView(windowComponentRef.hostView);
    containerEl.appendChild(windowComponentRef.location.nativeElement);
    return windowComponentRef;
  }

  private createFromTemplateRef(content: TemplateRef<any>, activeModal: ActiveModal): ContentRef {
    const context = {
      $implicit: activeModal,
      close(result: any): void {
        activeModal.close(result);
      },
      dismiss(reason: any): void {
        activeModal.dismiss(reason);
      }
    };
    const viewRef = content.createEmbeddedView(context);
    this.applicationRef.attachView(viewRef);
    return new ContentRef([viewRef.rootNodes], viewRef);
  }

  private createFromString(content: string): ContentRef {
    const component = this.document.createTextNode(`${content}`);
    return new ContentRef([[component]]);
  }

  private createFromComponent(
    moduleComponentFactoryResolver: ComponentFactoryResolver,
    contentInjector: Injector,
    content: any,
    context: ActiveModal
  ): ContentRef {
    const contentCmptFactory = moduleComponentFactoryResolver.resolveComponentFactory(content);
    const modalContentInjector = Injector.create({
      providers: [{ provide: ActiveModal, useValue: context }],
      parent: contentInjector
    });
    const componentRef = contentCmptFactory.create(modalContentInjector);
    const componentNativeEl = componentRef.location.nativeElement;
    this.applicationRef.attachView(componentRef.hostView);
    return new ContentRef([[componentNativeEl]], componentRef.hostView, componentRef);
  }

  private setOpened(comp: ComponentRef<ModalComponent>): void {
    const el = comp.location.nativeElement.querySelector('.modal-overlay') as HTMLElement;
    if (!el.classList.contains('is-open')) {
      el.classList.add('is-open');
    }
  }

  private setHidden(comp: ComponentRef<ModalComponent>): void {
    const el = comp.location.nativeElement.querySelector('.modal-overlay') as HTMLElement;
    if (el.classList.contains('is-open')) {
      el.classList.remove('is-open');
    }
  }

  private registerModalRef(modalRef: ModalRef): void {
    const unregisterModalRef = () => {
      this.modalRefs = this.modalRefs.filter(x => x !== modalRef);
    };
    this.modalRefs.push(modalRef);
    modalRef.result.then(unregisterModalRef, unregisterModalRef);
  }

  private applyOptions(modalInstance: ModalComponent, options: ModalOptions): void {
    this.modalOptions.forEach((option: string) => {
      if (options[option as ModalOption]) {
        (modalInstance as any)[option] = options[option as ModalOption];
      }
    });
  }

  private registerWindowComponent(windowComponent: ComponentRef<ModalComponent>): void {
    this.windowComponents.push(windowComponent);
    this.windowComponentChanged.next();

    windowComponent.onDestroy(() => {
      this.windowComponents = this.windowComponents.filter(x => {
        if (x === windowComponent) {
          this.windowComponentChanged.next();
          return false;
        }

        return true;
      });
    });
  }
}
