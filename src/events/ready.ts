import { Client, Event } from '../class';

export default class Ready extends Event {
    public client: Client;

    constructor(client: Client) {
        super(client);
        this.event = 'ready';
    }

    public async run() {
        this.client.util.signale.start(`Client is now ready.`);
        this.client.users.get(`241361691730903040`).createMessage(`Client is now ready.`)
    }
}