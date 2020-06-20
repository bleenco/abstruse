export class SocketEvent {
  constructor(public type: string, public data: { event: string; id: string } | any) {}
}
