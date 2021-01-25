import { Message, Member } from "eris";
import { Client, Event } from "../class";
import noblox from 'noblox.js';

export default class ClearanceApplicationHandler extends Event {
    public client: Client;

    constructor(client: Client) {
        super(client);
        this.event = 'messageReactionAdd';
    }

    public async run(message: Message, emoji, reactor: Member) {
        if (message.channel.id !== `761266719334334504`) return;
        let newMsg = message
        if (!newMsg.embeds) {
            newMsg = await message.channel.getMessage(message.id)
        }

        const levelType = newMsg.embeds[0].title.slice(2,4)
        const userId: string = newMsg.embeds[0].footer.text;
        const check = await this.client.db.User.findOne({ robloxId: userId });
        let user;
        if (check) {
            user = this.client.users.get(check.discordId);
        }
        if (emoji.id !== "751634392052531230") {
            if (emoji.id === "751634391888953347") {
                if (!check) return
                user.createMessage(`**Your application has been denied.**\nUnfortunately, your ${levelType} application has been denied.`)
            }
            return;
        }
        let userRank;
        try {
            userRank = await noblox.getRankInGroup(7428213, Number(userId));
        } catch(err) {
            return;
        }
        let oldRank: string;
        let newRank: string;
        let status: boolean = true

        if (levelType == "L1") {
            if (userRank == 180) {
                try {
                    await noblox.setRank(7428213, Number(userId), 200)
                } catch(err) {
                    return;
                }
                oldRank = "[Class D]";
                newRank = "[Clearance Level 1]";
            }
        } else if (userRank == 200) {
            try {
                await noblox.setRank(7428213, Number(userId), 210)
            } catch (err) {
                status = false
                return;
            }
            oldRank = "[Clearance Level 1]";
            newRank = "[Clearance Level 2]";
        }


        const rankerThing = await this.client.db.User.findOne({ discordId: reactor.id })

        await this.client.util.rankLog(rankerThing.robloxId, userId, oldRank, newRank, `Application Acceptance`, reactor)
        if (!check) return

        await user.createMessage(`**Congratulations!**\nYour application has been accepted and you have been ranked \`${newRank}\`.`)
    }
}