import { Client, Command, RichEmbed, Collection } from '../class';
import { Message, Member, Role } from 'eris';
import axios from "axios";
import noblox from "noblox.js";

export default class update extends Command {

    constructor(client: Client) {
        super(client);
        this.name = 'update';
        this.description = 'Updates yourself or another user';
        this.usage = 'whois [member]';
        this.permissions = 0;
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {
        const channel = message.channel;
        let member: Member;
        if (!args[0]) member = message.member
        else if (this.checkPermissions(message.member, 2)){
            member = this.client.util.resolveMember(args.join(' '), message.guild)
            try {
                if (!member) member = await message.guild.getRESTMember(args[0])
            } catch (err) {
                return message.channel.createMessage(`User wasn't found.`)
            }
        } else {
            member = message.member
        }

        const check = await this.client.db.User.findOne({ discordId: message.member.id });
        if (!check) return await channel.createMessage(`\`${member.username}#${member.discriminator}\` is not verified.`)

        await this.client.util.update(member, message)
    }
}