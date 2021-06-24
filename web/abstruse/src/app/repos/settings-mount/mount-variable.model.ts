export class MountVariable {
  constructor(public id?: number, public host?: string, public container?: string) {}

  get val(): string {
    return `${this.host}:${this.container}`;
  }
}

export const generateMountVariable = (data: any): MountVariable => {
  return new MountVariable(data.id, data.host, data.container);
};
