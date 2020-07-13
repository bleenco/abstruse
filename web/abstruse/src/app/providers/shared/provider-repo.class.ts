export class ProviderRepo {
  isImported: boolean = false;

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
  ) {}

  get fullName(): string {
    return `${this.namespace}/${this.name}`;
  }
}

export class ProviderRepoPermission {
  constructor(public pull: boolean, public push: boolean, public admin: boolean) {}
}

export const generateProviderRepo = (data: any): ProviderRepo => {
  return new ProviderRepo(
    data.id,
    data.namespace,
    data.name,
    new ProviderRepoPermission(data.permission.pull, data.permission.push, data.permission.admin),
    data.branch,
    Boolean(data.private),
    data.clone,
    data.cloneSSH,
    data.link,
    new Date(data.createdAt),
    new Date(data.updatedAt)
  );
};
