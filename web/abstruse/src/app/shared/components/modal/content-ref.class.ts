import {
  Injector,
  TemplateRef,
  ViewRef,
  ViewContainerRef,
  Renderer2,
  ComponentRef,
  ComponentFactoryResolver,
  ApplicationRef
} from '@angular/core';

export class ContentRef {
  constructor(
    public nodes: any[],
    public viewRef?: ViewRef,
    public componentRef?: ComponentRef<any>
  ) {}
}

export class PopupService<T> {
  private windowRef!: ComponentRef<T> | null;
  private contentRef!: ContentRef | null;

  constructor(
    private type: any,
    private injector: Injector,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef
  ) {}

  open(content?: string | TemplateRef<any>, context?: any): ComponentRef<T> {
    if (!this.windowRef) {
      this.contentRef = this.getContentRef(content as string | TemplateRef<any>, context);
      this.windowRef = this.viewContainerRef.createComponent(
        this.componentFactoryResolver.resolveComponentFactory<T>(this.type),
        0,
        this.injector,
        this.contentRef.nodes
      );
    }

    return this.windowRef;
  }

  close(): void {
    if (this.windowRef) {
      this.viewContainerRef.remove(this.viewContainerRef.indexOf(this.windowRef.hostView));
      this.windowRef = null;

      if (this.contentRef?.viewRef) {
        this.applicationRef.detachView(this.contentRef.viewRef);
        this.contentRef.viewRef.destroy();
        this.contentRef = null;
      }
    }
  }

  private getContentRef(content: string | TemplateRef<any>, context?: any): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(context);
      this.applicationRef.attachView(viewRef);
      return new ContentRef([viewRef.rootNodes], viewRef);
    } else {
      return new ContentRef([[this.renderer.createText(`${content}`)]]);
    }
  }
}
