import { Client, Command } from '../class';
import { Message } from 'eris';

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
            await this.client.util.userMethods.update(message.guild.members.get(member))

        }

        await message.channel.createMessage(`Updated all users in the server.`)
    }
}