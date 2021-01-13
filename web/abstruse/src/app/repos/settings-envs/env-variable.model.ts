export class EnvVariable {
  constructor(
    public id?: number,
    public key?: string,
    public value?: string,
    public secret?: boolean
  ) {}

  get val(): string {
    return !!this.secret ? '**********' : String(this.value);
  }
}

export const generateEnvVariable = (data: any): EnvVariable => {
  return new EnvVariable(data.id, data.key, data.value, Boolean(data.secret));
};
