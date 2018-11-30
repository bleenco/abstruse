export class Hook {
  constructor(
    public url: string,
    public event_push: boolean = true,
    public event_pr: boolean = true,
    public id?: number,
    public content_type?: string,
    public active?: boolean,
    public created_at?: Date,
    public updated_at?: Date
  ) { }
}
