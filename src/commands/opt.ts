import { Client, Command, RichEmbed, Collection } from '../class';
import { Message, Member } from 'eris';

export default class rank extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'opt';
        this.permissions = 0;
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {
        if (args[0].toLowerCase() === "ssu") {
            await message.member.addRole(`773026252285542430`)
        } else if (args[0].toLowerCase() === "dev" || args[0].toLowerCase() === "dev notify") {
            await message.member.addRole(`770421273113001995`)
        }
    }
}