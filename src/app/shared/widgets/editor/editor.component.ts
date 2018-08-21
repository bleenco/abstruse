import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import 'monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.sass'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: EditorComponent, multi: true }]
})
export class EditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  innerValue: string;
  el: HTMLElement;
  editor: monaco.editor.IStandaloneCodeEditor;
  propagateChange = (_: any) => { };
  onTouched = () => { };
  onChangeCallback: (_: any) => void = () => { };

  constructor(public elementRef: ElementRef) { }

  writeValue(val: any): void {
    this.innerValue = val;
    if (this.editor && val) {
      this.editor.setValue(val);
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  get value(): string {
    return this.innerValue;
  }

  set value(val: string) {
    this.innerValue = val;
    this.onChangeCallback(this.innerValue);
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.editor');
    monaco.editor.defineTheme('abstruseTheme', this.generateTheme());

    this.editor = monaco.editor.create(this.el, {
      language: 'dockerfile',
      theme: 'abstruseTheme',
      fontSize: 12,
      minimap: {
        enabled: false
      },
      scrollbar: {
        horizontal: 'hidden',
        vertical: 'hidden',
        useShadows: false,
        horizontalScrollbarSize: 0,
        horizontalSliderSize: 0,
        verticalScrollbarSize: 0,
        verticalSliderSize: 0
      },
      fontWeight: '500',
      contextmenu: false,
      scrollBeyondLastLine: false,
      roundedSelection: false,
      lineNumbers: 'off',
      lineDecorationsWidth: 0
    });

    this.editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
      const val = this.editor.getValue();
      this.propagateChange(val);
      this.value = val;
    });
  }

  ngOnDestroy() {
    this.editor.dispose();
  }

  private generateTheme(): monaco.editor.IStandaloneThemeData {
    return {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#30D068', fontStyle: 'bold' }
      ],
      colors: {
        'editor.foreground': '#3c495a',
        'editor.background': '#FFFFFF',
        'editor.selectionBackground': '#e9e9e9',
        'editor.lineHighlightBackground': '#FFFFFF',
        'editorCursor.foreground': '#3c495a',
        'editorWhitespace.foreground': '#FFFFFF'
      }
    };
  }
}
