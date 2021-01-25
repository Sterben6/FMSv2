import { Client, Command, RichEmbed, Collection } from '../class';
import { Message, Member } from 'eris';
import axios from 'axios';
import moment from 'moment';

export default class whois extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'whois';
        this.description = 'Shows information on a user';
        this.usage = 'whois [member]';
        this.permissions = 0;
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {
        const userEmbed = new RichEmbed()
        let member: Member;
        if (!args[0]) member = message.member
        else {
            member = this.client.util.resolveMember(args.join(' '), message.guild)
            try {
                if (!member) member = await message.guild.getRESTMember(args[0])
            } catch (err) {
                return message.channel.createMessage(`User wasn't found.`)
            }
        }

        userEmbed.setAuthor(`${member.username}#${member.discriminator}`, member.avatarURL)
        userEmbed.setThumbnail(member.avatarURL)
        for (const role of member.roles.map((r) => message.guild.roles.get(r)).sort((a, b) => b.position - a.position)) {
            if (role?.color !== 0) {
                userEmbed.setColor(role.color);
                break;
            }
        }

        let userInfo = ""
        userInfo += `**Mention:** <@${member.id}>\n`;
        userInfo += `**Discord ID:** ${member.id}\n`;
        userInfo += `**Display Name:** ${member.nick || member.username}\n`;
        userInfo += `**Joined Server On:** ${moment(new Date(member.joinedAt)).format('dddd, MMMM Do YYYY, h:mm:ss A')} ET\n`;
        userInfo += `**Account Created On:** ${moment(new Date(member.createdAt)).format('dddd, MMMM Do YYYY, h:mm:ss A')} ET\n`;
        const check = await this.client.db.User.findOne({ discordId: member.id })
        if (check) {
            const data = (await axios.get(`https://users.roblox.com/v1/users/${check.robloxId}`)).data
            userInfo += `**Roblox Username:** ${data.displayName}\n`;
            userInfo += `**Roblox ID:** ${check.robloxId}\n`;
        }
        userEmbed.addField(`User Information:`, userInfo)

        if (member.roles.length > 0) {
            let roleInfo = ""
            for (const role of member.roles.map((r) => message.guild.roles.get(r)).sort((a, b) => b.position - a.position)) {
                roleInfo += `<@&${role.id}> `
            }
            userEmbed.addField(`Roles [${member.roles.length}]:`, roleInfo)
        }

        await message.channel.createMessage({ embed: userEmbed })
    }
}