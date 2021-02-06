import childProcess from 'child_process'
import {Client, Command, RichEmbed, UserMethods} from '.'
import noblox from 'noblox.js'
import signale from 'signale';
import {Member, Guild} from "eris";

export default class Util {
    public client: Client

    public signale: signale.Signale;

    public userMethods: UserMethods;

    constructor(client: Client) {
        this.client = client;
        this.signale = signale;
        this.signale.config({
            displayDate: true,
            displayTimestamp: true,
            displayFilename: true,
        });
        this.userMethods = new UserMethods(this.client);
    }

    /**
     * Execute a terminal command
     * @param command - The command you are trying to run
     * @param options - tbh kinda useless, idk why its there
     */
    public async exec(command: string, options: childProcess.ExecOptions = {}): Promise<string> {
        return new Promise((resolve, reject) => {
            childProcess.exec(command, options, (err, stdout, stderr) => {
                if (stderr) reject(new Error(`Command failed: ${command}\n${stderr}`));
                if (err) reject(err);
                resolve(stdout);
            });
        });
    };

    /**
     * Resolve a command from a search word
     * @param search - The command you're searching for
     * @returns Promise<Command> - Returns the object of the command if found
     */
    public resolveCommand(search: string | string[]): Promise<Command> {
        let resolvedCommand: Command;
        const commandQuery = this.client.commands.toArray()
        if (typeof search === 'string') search = search.split(' ')
        resolvedCommand = commandQuery.find((command) => command.name === search[0].toLowerCase() || command.aliases.includes(search[0].toLowerCase()))
        console.log(search)
        if (!resolvedCommand) return Promise.resolve(null)
        search.shift()
        while (resolvedCommand.subcommands.size > 0 && search.length > 0) {
            const subCommand = resolvedCommand.subcommands.toArray();
            const found = subCommand.find((c) => c.name === search[0].toLowerCase() || c.aliases.includes(search[0].toLowerCase()))
            if (!found) break;
            resolvedCommand = found
            search.shift()
        }

        return Promise.resolve(resolvedCommand)
    }

    /**
     * Create a rank log
     * @param ranker - User ID of the person ranking someone
     * @param ranked - User ID of the person ranked
     * @param oldrank - The old rank of the user being ranked
     * @param newrank - The new rank of the user being ranked
     * @param reason - The reason for ranking the user
     * @param user - The user who ranked the person
     */
    public async rankLog(ranker: string, ranked: string, oldrank: string, newrank: string, reason: string, user: Member) {
        const rankerRank = await noblox.getRankNameInGroup(7428213, Number(ranker));
        const rankedUsername = await noblox.getUsernameFromId(Number(ranked));

        const embed = new RichEmbed()
        embed.setTitle("**Rank Log**")
        embed.setDescription(`\n**${user.nick}**\n${rankerRank}`)
        embed.setColor(4868682)
        embed.setFooter("Foundation Management Systems")
        embed.addField("Username:", rankedUsername)
        embed.addField("Previous Rank:", oldrank)
        embed.addField("New Rank:", newrank)
        embed.addField("Reason:", reason)
        embed.setTimestamp()

        await this.client.createMessage("775033232977690624", { embed })
    }

    public resolveMember(query: string, { members }: Guild): Member | undefined {
        return members.find((m) => `${m.username}#${m.discriminator}` === query || m.username === query || m.id === query.replace(/[<@!>]/g, '') || m.nick === query) // Exact match for mention, username+discrim, username and user ID
            || members.find((m) => `${m.username.toLowerCase()}#${m.discriminator}` === query.toLowerCase() || m.username.toLowerCase() === query.toLowerCase() || (m.nick && m.nick.toLowerCase() === query.toLowerCase())) // Case insensitive match for username+discrim, username
            || members.find((m) => m.username.toLowerCase().startsWith(query.toLowerCase()) || (m.nick && m.nick.toLowerCase().startsWith(query.toLowerCase())));
    }

    public handleError(error) {

    }


    public splitString(string: string, length: number): string[] {
        if (!string) return [];
        if (Array.isArray(string)) string = string.join('\n');
        if (string.length <= length) return [string];
        const arrayString: string[] = [];
        let str: string = '';
        let pos: number;
        while (string.length > 0) {
            pos = string.length > length ? string.lastIndexOf('\n', length) : string.length;
            if (pos > length) pos = length;
            str = string.substr(0, pos);
            string = string.substr(pos);
            arrayString.push(str);
        }
        return arrayString;
    }

    get rankMaps() {
        return {
            abrevToNum: {
                'CD': 180,
                'CE': 190,
                'L1': 200,
                'L2': 210,
                'L3': 220,
                'L4': 230,
                'SiD': 240,
                'O5': 250,
                'Adm': 255
            },
            numToRoleId: {
                180: '744227637152448542',
                190: '744227712486473728',
                200: '744227584291897434',
                210: '744227535558279188',
                220: '744227442817892352',
                230: '744227250727288912',
                240: '744227055901605928',
                250: '744221117748609184',
                254: '744221117748609184',
                255: '744220915880951859'
            }
        }
    }
}