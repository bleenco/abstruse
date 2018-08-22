import { distanceInWordsToNow } from 'date-fns';

export class Image {
  constructor(
    public repository: string,
    public ready: boolean,
    public id: string = null,
    public created: number = null,
    public tag: string = null,
    public size: number = null
  ) { }

  getSHA(): string {
    return this.id ? this.id.substring(0, 12) : '/';
  }

  getCreatedTime(): string {
    if (this.created) {
      return distanceInWordsToNow(new Date(this.created * 1000));
    } else {
      return '';
    }
  }
}
