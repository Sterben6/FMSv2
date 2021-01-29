import { Message, TextChannel, NewsChannel } from "eris";
import { Client, Event } from "../class";

export default class CommandHandler extends Event {
    public client: Client;

    constructor(client: Client) {
        super(client);
        this.event = 'messageCreate';
    }

    public async run(message: Message) {
        if (message.author.bot || !message.content.startsWith(this.client.config.prefix)) return;

        const noPrefix: string[] = message.content.slice(this.client.config.prefix.length).trim().split(/ +/g);
        const command = await this.client.util.resolveCommand(noPrefix.shift().toLowerCase())
        if (!command) return;

        if (command.guildOnly && (message.channel.type !== 0)) return;
        if (!command.enabled) return message.channel.createMessage(`**This command has been disabled.**`);
        if (!command.checkPermissions(message.member)) return;
        try {
            await command.run(message, noPrefix)
        } catch (err) {
            this.client.util.signale.error(err)
        }
    }

}