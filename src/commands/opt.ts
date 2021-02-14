import { Client, Command, RichEmbed } from '../class';
import { Message } from 'eris';
import opt_add from "./opt_add";
export default class opt extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'opt';
        this.permissions = 0;
        this.subcmds = [opt_add]
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {
        if (!args[0]) {
            const roles = await this.client.db.Role.find();
            const embed = new RichEmbed();
            embed.setTitle(`Roles`);
            embed.setDescription(`Use \`-opt [role name]\` to be assigned/unassigned a role.`);
            embed.setFooter(`Foundation Management Systems`);
            embed.setTimestamp();

            for (const role of roles) {
                let roleInfo = ""
                if (message.member.roles.includes(role.roleId)) roleInfo += `*You have this role*\n`;
                if (role.description) roleInfo += `**Description:** ${role.description}\n`;
                roleInfo += `**Permissions:** ${role.permission}\n`;
                roleInfo += `**Mention:** <@&${role.roleId}>`;
                embed.addField(role.key, roleInfo);
            }

            await message.channel.createMessage({ embed });
            return;
        }
        const role = await this.client.db.Role.find({key: args[0]});
        if (!role) {
            return message.channel.createMessage(`No role with that name was found.`)
        }
        try {
            await message.member.addRole(role.roleId)
            return message.channel.createMessage(`Added ${role.key} to your roles.`)
        } catch (err) {
            return message.channel.createMessage(`An error occurred while attempting to add the role. Please try again and if the error persists, contact the developer.`)
        }
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