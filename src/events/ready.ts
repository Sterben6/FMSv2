import { Client, Event } from '../class';

export default class Ready extends Event {
    public client: Client;

    constructor(client: Client) {
        super(client);
        this.event = 'ready';
    }

    public async run() {
        this.client.util.signale.start(`Client is now ready.`);
    }
}