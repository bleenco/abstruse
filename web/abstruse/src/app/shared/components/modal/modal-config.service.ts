import { Injectable, Injector } from '@angular/core';

export interface ModalOptions {
  backdrop?: boolean | 'white';
  backdropOpacity?: number;
  beforeDismiss?: () => boolean | Promise<boolean>;
  container?: string;
  injector?: Injector;
  keyboard?: boolean;
  scrollable?: boolean;
  size?: 'small' | 'large' | 'medium';
}

@Injectable({ providedIn: 'root' })
export class ModalConfig implements Required<ModalOptions> {
  backdrop: boolean | 'white' = true;
  backdropOpacity = .8;
  beforeDismiss: () => boolean | Promise<boolean>;
  container: string;
  injector: Injector;
  keyboard = true;
  scrollable: boolean;
  size: 'small' | 'large' | 'medium';
}
