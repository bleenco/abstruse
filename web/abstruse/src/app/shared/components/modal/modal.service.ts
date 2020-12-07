import { Injectable, Injector, ComponentFactoryResolver } from '@angular/core';
import { ModalOptions, ModalConfig } from './modal-config.service';
import { ModalRef } from './modal-ref.class';
import { ModalStack } from './modal-stack.class';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(
    private moduleComponentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private modalStack: ModalStack,
    private config: ModalConfig
  ) {}

  open<T>(content: T, options: ModalOptions = {}): ModalRef<T> {
    const combinedOptions = Object.assign({}, this.config, options);
    return this.modalStack.open(this.moduleComponentFactoryResolver, this.injector, content, combinedOptions);
  }

  dismissAll(reason?: any): void {
    this.modalStack.dismissAll(reason);
  }
  hasOpenModals(): boolean {
    return this.modalStack.hasOpenModals();
  }
}
