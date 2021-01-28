import childProcess from 'child_process'
import {Client, Command, RichEmbed} from '.'
import noblox from 'noblox.js'
import signale from 'signale';
import {Member, Guild, Role} from "eris";

export default class Util {
    public client: Client

    public signale: signale.Signale;

    constructor(client: Client) {
        this.client = client
        this.signale = signale;
        this.signale.config({
            displayDate: true,
            displayTimestamp: true,
            displayFilename: true,
        });
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
    public resolveCommand(search: string): Promise<Command> {
        let resolvedCommand: Command
        const commandQuery = this.client.commands.toArray()
        resolvedCommand = commandQuery.find((command) => command.name === search.toLowerCase() || command.aliases.includes(search.toLowerCase()))

        if (resolvedCommand) return Promise.resolve(resolvedCommand)
        else return Promise.resolve(null)
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

    public async update(member, message?) {
        const check = await this.client.db.User.findOne({ discordId: member.id });
        let departments: string[] = []
         try {
            departments = await this.getDepartments(check.robloxId)
        } catch (e) {

         }
        let rolesToHave: Role[] = []
        let rolesToNotHave = this.globalRoleList
        if (!check) {
            for (const role of rolesToNotHave) {
                if (member.roles.includes(role)) {
                    try {
                        await member.removeRole(role)
                    } catch (e) {}
                }
            }
            return
        }

        if (departments.length > 0) {
            for (const dept of departments) {
                if (dept === "Ethics Committee") rolesToHave.push(await member.guild.roles.get(`754058074830143499`))
                else if (dept === "Engineering & Technical Services") rolesToHave.push(await member.guild.roles.get(`754058219730632835`))
                else if (dept === "Department of External Affairs") rolesToHave.push(await member.guild.roles.get(`754058117544935474`))
                else if (dept === "Scientific Department") rolesToHave.push(await member.guild.roles.get(`754058149287297154`))
                else if (dept === "Security Corps") rolesToHave.push(await member.guild.roles.get(`754058039635607573`))
            }
        }

        let rolesAdded: string[] = []
        let rolesRemoved: string[] = []

        const nickAndRole = await this.getRankRoleAndNickname(member);
        try {
            await member.edit({
                nick: nickAndRole.nickname
            })
        } catch (e) {

        }

        if (nickAndRole.role !== undefined) rolesToHave.push(await member.guild.roles.get(nickAndRole.role))

        for (const role of rolesToHave) {
            if (!(member.roles.includes(role.id))) {
                try {
                    await member.addRole(role.id)
                } catch (err) {

                }
                rolesAdded.push(role.id)
            }
            const index = rolesToNotHave.indexOf(role.id)
            delete rolesToNotHave[index]
        }
        for (const role of rolesToNotHave) {
            if (member.roles.includes(role)) {
                try {
                    await member.removeRole(role)
                } catch (err) {

                }
                rolesRemoved.push(role)
            }
        }

        let roleAddedField = ""
        let roleRemovedField = ""
        for (const role of rolesAdded) {
            roleAddedField += `- <@&${role}>\n`
        }
        for (const role of rolesRemoved) {
            roleRemovedField += `- <@&${role}>\n`
        }

        if (!member.roles.includes(`754054530374566094`)) {
            await member.addRole(`754054530374566094`)
            roleAddedField += `- <@&754054530374566094>\n`
        }

        if (!message) return
        const userEmbed = new RichEmbed()
        userEmbed.setTitle(`Update:`)
        userEmbed.addField(`Nickname`, nickAndRole.nickname);
        userEmbed.addField(`Added Roles`, roleAddedField || "None")
        userEmbed.addField(`Removed Roles`, roleRemovedField || "None")
        message.channel.createMessage({ embed: userEmbed })
    }

    public async getRankRoleAndNickname(member) {
        const check = await this.client.db.User.findOne({ discordId: member.id });
        let userRank;
        try {
            userRank = await noblox.getRankInGroup(7428213, Number(check.robloxId))
        } catch (err) {
            return {role: undefined, nickname: undefined}
        }
        const roleId = this.client.util.rankMaps.numToRoleId[userRank];
        let nickNamePrefix = this.rankToAbrev[userRank];

        if (userRank === 250) {
            const departments = await this.getDepartments(check.robloxId);
            let num: string;

            for (const dept of departments) {
                const deptRank = await noblox.getRankNameInGroup(this.deptToId[dept], check.robloxId);
                if (deptRank === "[Overseer]") {
                    num = this.deptToO5Num[dept]
                    break;
                }
            }
            nickNamePrefix = nickNamePrefix.replace('#', String(num))
        }
        const username = await noblox.getUsernameFromId(Number(check.robloxId))
        return {role: roleId, nickname: `${nickNamePrefix} ${username}`}
    }

    public async getDepartments(userId) {
        let departments: string[] = [];

        const userGroups = await noblox.getGroups(Number(userId));

        for (const group of userGroups) {
            if (group.Id === 8211500) departments.push("Ethics Committee")
            else if (group.Id === 7759494) departments.push("Engineering & Technical Services")
            else if (group.Id === 7759188) departments.push("Department of External Affairs")
            else if (group.Id === 7433003) departments.push("Scientific Department")
            else if (group.Id === 7432896) departments.push("Security Corps")
        }

        return departments
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

    public globalRoleList = [
        `754058117544935474`, // DEA
        `754058149287297154`, // ScD
        `754058039635607573`, // SC
        `754058074830143499`, // EC
        `754058219730632835`, // E&TS
        `744221117748609184`, // O5
        `744227055901605928`, // SiD
        `744227250727288912`, // L4
        `744227442817892352`, // L3
        `744227535558279188`, // L2
        `744227584291897434`, // L1
        `744227712486473728`, // CE
        `744227637152448542`, // CD
    ]

    public rankToAbrev = {
        180: '[C-D]',
        190: '[C-E]',
        200: '[L-1]',
        210: '[L-2]',
        220: '[L-3]',
        230: '[L-4]',
        240: '[SiD]',
        250: '[O5-#]',
        255: '[ADM]'
    }

    public deptToId = {
        'Ethics Committee': 8211500,
        'Engineering & Technical Services': 7759494,
        'Department of External Affairs': 7759188,
        'Scientific Department': 7433003,
        'Security Corps': 7432896,
    }

    public deptToO5Num = {
        'Ethics Committee': 1,
        'Engineering & Technical Services': 5,
        'Department of External Affairs': 2,
        'Scientific Department': 4,
        'Security Corps': 3,
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