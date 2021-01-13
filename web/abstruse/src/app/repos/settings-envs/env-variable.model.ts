export class EnvVariable {
  constructor(
    public id: number,
    public key: string,
    public value: string,
    public secret: boolean
  ) {}
}
