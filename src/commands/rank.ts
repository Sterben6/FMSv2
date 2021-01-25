import { Client, Command, RichEmbed, Collection } from '../class';
import { Message, Member } from 'eris';

export default class rank extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'rank';
        this.description = 'Ranks a member in the group';
        this.usage = 'rank [user] [newRank] [reason]';
        this.permissions = 2;
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {

    }

    public async rank(member) {

    }
}