export class ProviderRepo {
  isImported: boolean;

  constructor(
    public id?: string,
    public namespace?: string,
    public name?: string,
    public permission?: ProviderRepoPermission,
    public branch?: string,
    public isPrivate?: boolean,
    public clone?: string,
    public cloneSSH?: string,
    public link?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) { }

  get fullName(): string {
    return `${this.namespace}/${this.name}`;
  }
}

export class ProviderRepoPermission {
  constructor(
    public pull: boolean,
    public push: boolean,
    public admin: boolean
  ) { }
}
