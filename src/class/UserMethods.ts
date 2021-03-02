import {Client, RichEmbed} from '.'
import noblox from 'noblox.js'
import {Member, Role, Message} from "eris";
import axios from 'axios';

export default class UserMethods {
    public client: Client;

    public logChannels: {
        rankLogs: string
    }

    constructor(client: Client) {
        this.client = client;
        this.logChannels = {
            rankLogs: ''
        };
    }

    public async update(member: Member, message?: Message) {
        const userInfo = await this.client.db.User.findOne({ discordId: member.id });
        let rolesToNotHave = this.globalRoleList
        let rolesToHave: Role[] = [];
        let rolesAdded: string[] = [];
        let rolesRemoved: string[] = [];

        if (!userInfo) {
            for (const role of rolesToNotHave) {
                if (member.roles.includes(role)) {
                    await member.removeRole(role)
                }
            }
            return;
        }

        const departments: number[] = await this.getDepartments(Number(userInfo.robloxId));
        for (const dept of departments) {
            if (dept === 1) rolesToHave.push(member.guild.roles.get(`754058074830143499`));
            else if (dept === 5) rolesToHave.push(member.guild.roles.get(`754058219730632835`));
            else if (dept === 2) rolesToHave.push(member.guild.roles.get(`754058117544935474`));
            else if (dept === 4) rolesToHave.push(member.guild.roles.get(`754058149287297154`));
            else if (dept === 3) rolesToHave.push(member.guild.roles.get(`754058039635607573`));
            else if (dept === 6) rolesToHave.push(member.guild.roles.get(`814989730093072407`));
            else if (dept === 7) rolesToHave.push(member.guild.roles.get(`814989681296015380`));
        }

        const nick = await this.getNickname(Number(userInfo.robloxId));
        try {
            await member.edit({ nick });
        } catch (err) {
            if (message) await message.channel.createMessage(`FMS does not have the correct permissions to update this member's nickname.`);
        }

        const groupRank = await this.getGroupRank(Number(userInfo.robloxId), 7428213);
        if (groupRank) rolesToHave.push(member.guild.roles.get(this.client.util.rankMaps.numToRoleId[groupRank]));

        for (const role of rolesToHave) {
            if (!(member.roles.includes(role.id))) {
                await member.addRole(role.id)
                rolesAdded.push(role.id)
            }
            const index = rolesToNotHave.indexOf(role.id)
            delete rolesToNotHave[index]
        }

        console.log(`removing roles...`)

        for (const role of rolesToNotHave) {
            console.log(role)
            console.log(member.roles)
            if (member.roles.includes(role)) {
                console.log(`removed role ${role}`)
                await member.removeRole(role)
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

        const userEmbed = new RichEmbed()
        userEmbed.setTitle(`Update:`)
        userEmbed.addField(`Nickname`, nick || "N/A");
        userEmbed.addField(`Added Roles`, roleAddedField || "None");
        userEmbed.addField(`Removed Roles`, roleRemovedField || "None");
        userEmbed.setFooter(`Foundation Management Systems`);
        userEmbed.setTimestamp()
        if (message) await message.channel.createMessage({ embed: userEmbed })
    }

    public async getNickname(userId) {
        let userRank;
        try {
            userRank = await this.getGroupRank(userId, 7428213)
        } catch (error) {
            return;
        }

        if (!this.rankToAbrev[userRank]) {
            return await noblox.getUsernameFromId(userId);
        }

        let nickName = `${this.rankToAbrev[userRank]} ${await noblox.getUsernameFromId(userId)}`

        if (userRank >= 250) {
            const departments = await this.getDepartments(userId);
            for (const dept of departments) {

                console.log(dept)

                const deptRole = await this.getGroupRole(userId, this.deptToId[dept])

                console.log(deptRole)

                if (deptRole === "[Overseer]") {
                    nickName = nickName.replace('#', String(dept))
                    break;
                }
            }
        }
        return nickName
    }

    public async getDepartments(userId) {
        let departments: number[] = [];

        const userGroups = (await axios.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`)).data.data;

        for (const group of userGroups) {
            if (group.group.id === 8211500) departments.push(1)
            else if (group.group.id === 7759494) departments.push(5)
            else if (group.group.id === 7759188) departments.push(2)
            else if (group.group.id === 7433003) departments.push(4)
            else if (group.group.id === 7432896) departments.push(3)
            else if (group.group.id === 9763859) departments.push(6)
            else if (group.group.id === 9764274) departments.push(7)
        }

        return departments
    }

    public async getGroupRank(userId, groupId) {
        const userGroups = (await axios.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`)).data.data;

        const rank = userGroups.find(group => group.group.id === groupId)

        if (!rank) return null

        return rank.role.rank
    }

    public async getGroupRole(userId, groupId) {
        const userGroups = (await axios.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`)).data.data;

        const rank = userGroups.find(group => group.group.id === groupId)

        if (!rank) return null

        return rank.role.name
    }

    public async getAge(userId) {
        const joinDate = new Date((await axios.get(`https://users.roblox.com/v1/users/${userId}`)).data.created);
        const currentTime = new Date()
        return Math.round(Math.abs((joinDate.getTime() - currentTime.getTime()) / (24 * 60 * 60 * 1000)))
    }

    public rankToAbrev = {
        180: '[C-D]',
        190: '[C-E]',
        200: '[L-1]',
        210: '[L-2]',
        220: '[L-3]',
        230: '[L-4]',
        240: '[SiD]',
        250: '[O5-#]',
        254: '[O5-#]',
        255: '[ADM]'
    }

    public deptToId = {
        1: 8211500,
        2: 7759188,
        3: 7432896,
        4: 7433003,
        5: 7759494,
    }

    public globalRoleList = [
        `754058117544935474`, // DEA
        `814989730093072407`, // DoD
        `814989681296015380`, // MD
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
}
