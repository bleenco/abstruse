import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanizeBytes'
})
export class HumanizeBytesPipe implements PipeTransform {

  transform(value: any, args?: any): string {
    if (value === '') {
      return '/';
    }

    return this.humanizeBytes(value || 0);
  }

  private humanizeBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 Byte';
    }

    const k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
