export class Hook {
  constructor(
    public id: number,
    public active: boolean,
    public name: string,
    public target: string,
    public skipVerify: boolean,
    public events: string[]
  ) {}
}

export interface HookData {
  branch: boolean;
  pullRequest: boolean;
  push: boolean;
  tag: boolean;
}

export const generateHook = (data: any): Hook => {
  return new Hook(Number(data.ID), Boolean(data.Active), data.Name, data.Target, Boolean(data.SkipVerify), data.Events);
};
