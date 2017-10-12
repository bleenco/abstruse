import { inject } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;

  beforeEach(inject([DomSanitizer], (sanitazer: DomSanitizer) => {
    pipe = new SafeHtmlPipe(sanitazer);
  }));

  it('transform html', () => {
    const value: SafeHtml = pipe.transform('<div>test</div>');
    expect(value.toString()).toContain('<div>test</div>');
  });

});
