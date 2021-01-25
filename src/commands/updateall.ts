import { Client, Command, RichEmbed, Collection } from '../class';
import { Message, Member } from 'eris';

export default class updateall extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'updateall';
        this.description = 'Updates every member in the guild.';
        this.usage = 'updateall';
        this.permissions = 5;
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {
        await message.channel.createMessage(`Updating...`)
        const guildMembers = message.guild.members;
        for (const member in guildMembers) {
            // @ts-ignore
            await this.client.util.update(member)
        }

        await message.channel.createMessage(`Updated all users in the server.`)
    }
}