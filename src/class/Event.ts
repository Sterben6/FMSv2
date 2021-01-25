import { Client } from '.';

export default class Event {
    public client: Client

    public event: string;

    constructor(client: Client) {
        this.client = client;
        this.event = '';
        this.run = this.run.bind(this);
    }

    public async run(...args: any[]): Promise<any> { return Promise.resolve(); }
}
