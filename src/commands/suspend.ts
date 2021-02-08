import { Client, Command, RichEmbed } from '../class';
import { Message, Member } from 'eris';
import axios from "axios";

export default class suspend extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'suspend';
        this.description = 'Ranks a user Class-E in the group and changes their roles.';
        this.usage = 'suspend [username] [length (optional)] [reason]';
        this.permissions = 2;
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {
        const username: string = args[0]
        let length: string = args[1]
        let reason: string;
        if (!length.toLowerCase().startsWith(`days`)) {
            length = "indefinite"
            reason = args[1]
        } else {
            const thing: string[] = length.split(`:`)
            length = thing[1]
        }
        if (!reason) reason = args[2];

        const userId = (await axios.get(`http://api.roblox.com/users/get-by-username?username=${username}`)).data.Id;
        const discordId = (await this.client.db.User.findOne({ robloxId: userId})).discordId
        if (discordId) {
            const notificationEmbed = new RichEmbed()
            notificationEmbed.setColor("a30a0a")
            notificationEmbed.setTitle(`Suspension Notice`)
            notificationEmbed.setDescription(`On behalf of the Foundation's High Command, this is an official notification notifying you that you have been suspended.\nBelow you will see all the information pertaining to your suspension.`)
            notificationEmbed.addField(`Username:`, username)
            if (length) notificationEmbed.addField(`Length:`, `${length} days`)
            notificationEmbed.addField(`Reason:`, reason)
            try {
                this.client.users.get(discordId).createMessage({embed: notificationEmbed})
            } catch (err) {

            }
        }

    }
}