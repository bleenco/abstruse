import { humanizeBytes } from '../../shared/common/bytes';

export class Image {
  constructor(
    public id: number,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date,
    public tags: Tag[]
  ) {}

  get latestTag(): string {
    const latest = this.latest();
    return latest.tag;
  }

  get latestSize(): string {
    const latest = this.latest();
    return humanizeBytes(latest.size);
  }

  get latestDate(): Date {
    const latest = this.latest();
    return latest.buildTime;
  }

  private latest(): Tag {
    return this.tags.find(t => t.buildTime.getTime() === Math.max(...this.tags.map(tt => tt.buildTime.getTime())))!;
  }
}

export class Tag {
  constructor(
    public id: number,
    public tag: string,
    public dockerfile: string,
    public digest: string,
    public size: number,
    public buildTime: Date,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  get fileSize(): string {
    return humanizeBytes(this.size);
  }
}

export const generateImage = (data: any): Image => {
  return new Image(
    Number(data.id),
    data.name,
    new Date(data.createdAt),
    new Date(data.updatedAt),
    data.tags.map(generateTag)
  );
};

export const generateTag = (data: any): Tag => {
  return new Tag(
    Number(data.id),
    data.tag,
    data.dockerfile,
    data.digest,
    data.size,
    new Date(data.buildTime),
    new Date(data.createdAt),
    new Date(data.updatedAt)
  );
};
