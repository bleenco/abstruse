import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
  Renderer2,
  Inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { WindowService } from '../../services/window.service';

let loadedMonaco = false;
let loadPromise: Promise<void>;
declare const monaco: any;
declare const require: any;

@Component({
  selector: 'app-editor',
  templateUrl: 'app-editor.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: AppEditorComponent,
    multi: true
  }]
})
export class AppEditorComponent implements AfterViewInit, ControlValueAccessor {
  @ViewChild('editorContainer') editorContainer: ElementRef;
  @Output() onInit = new EventEmitter<any>();
  value: string;
  editor: any;
  opts: any;
  windowResizeSubscription: Subscription;
  propagateChange = (_: any) => {};
  onTouched = () => {};

  constructor(
    private windowService: WindowService,
    private zone: NgZone,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: any
  ) { }

  writeValue(val: any): void {
    this.value = val;
    setTimeout(() => {
      if (this.editor && val) {
        this.editor.setValue(val);
      }
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @Input('options')
  set options(options: string) {
    this.opts = options;
    if (this.editor) {
      this.editor.dispose();
      this.initMonaco(this.opts);
    }
  }

  get options(): string {
    return this.opts;
  }

  ngAfterViewInit(): void {
    if (loadedMonaco) {
      loadPromise.then(() => this.initMonaco(this.opts));
    } else {
      loadedMonaco = true;
      loadPromise = new Promise<void>((resolve: any) => {
        if (typeof (<any>window).monaco === 'object') {
          resolve();
        }

        let onGotAmdLoader: any = () => {
          (<any>window).require.config({ paths: { 'vs': 'monaco/vs' } });
          (<any>window).require(['vs/editor/editor.main'], () => {
            this.initMonaco(this.opts);
            resolve();
          });
        };

        if (!(<any>window).require) {
          let loaderScript: HTMLScriptElement = this.renderer.createElement('script');
          loaderScript.type = 'text/javascript';
          loaderScript.src = 'monaco/vs/loader.js';
          loaderScript.addEventListener('load', onGotAmdLoader);
          this.document.body.appendChild(loaderScript);
        } else {
          onGotAmdLoader();
        }
      });
    }
  }

  private initMonaco(options: any): void {
    monaco.editor.defineTheme('abstruseTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '000000' },
        { foreground: 'FFFFFF' }
      ],
      colors: {
        'editor.foreground': '#FFFFFF',
        'editor.background': '#000000',
      }
    });

    this.editor = monaco.editor.create(this.editorContainer.nativeElement, options);
    if (this.value) {
      this.editor.setValue(this.value);
    }

    this.editor.onDidChangeModelContent((e: any) => {
      let val = this.editor.getValue();
      this.propagateChange(val);
      this.zone.run(() => this.value = val);
    });

    if (this.windowResizeSubscription) {
      this.windowResizeSubscription.unsubscribe();
    }

    this.windowResizeSubscription = this.windowService.resize.subscribe(() => this.editor.layout());
    this.onInit.emit(this.editor);
  }

  ngOnDestroy() {
    if (this.windowResizeSubscription) {
      this.windowResizeSubscription.unsubscribe();
    }

    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }
}
