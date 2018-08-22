import { distanceInWordsToNow } from 'date-fns';

export class Image {
  building: boolean;

  constructor(
    public repository: string,
    public ready: boolean,
    public id: string = null,
    public created: number = null,
    public tag: string = null,
    public size: number = null,
    public buildLog: string = ''
  ) { }

  getSHA(): string {
    return this.id ? this.id.substring(0, 12) : '';
  }

  getCreatedTime(): string {
    if (this.created) {
      return distanceInWordsToNow(new Date(this.created * 1000));
    } else {
      return '';
    }
  }

  appendLog(log: string): void {
    this.buildLog += log;
  }
}
