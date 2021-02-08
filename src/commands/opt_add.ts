import { Client, Command, RichEmbed } from '../class';
import { Message } from 'eris';

export default class opt_add extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'add';
        this.permissions = 4;
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {
        await message.channel.createMessage(`hi`)
    }

    public PermToString = {
        0: 'Everyone',
        1: 'Level-3+',
        2: 'Level-4+',
        3: 'Site Director+',
        4: 'Overseer Council+',
        5: 'The Administrator'
    }
}