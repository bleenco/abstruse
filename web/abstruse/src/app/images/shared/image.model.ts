export class Image {
  constructor(
    public id: number,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date,
    public tags: Tag[]
  ) {}
}

export class Tag {
  constructor(
    public id: number,
    public tag: string,
    public dockerfile: string,
    public digest: string,
    public buildTime: Date,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
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
    new Date(data.buildTime),
    new Date(data.createdAt),
    new Date(data.updatedAt)
  );
};
