import { Client, Command, RichEmbed, Collection } from '../class';
import { Message } from 'eris';
import axios from 'axios';

export default class verify extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'verify';
        this.description = 'Verifies your account with the bot.';
        this.usage = 'verify';
        this.permissions = 0;
        this.enabled = true;
    }

    public async run(message: Message, args: string[]) {
        const channel = message.channel;

        const check = await this.client.db.User.findOne({ discordId: message.member.id });
        if (check) {
            const name = (await axios.get(`https://users.roblox.com/v1/users/${check.robloxId}`)).data.displayName;
            await channel.createMessage(`You are already verified to \`${name}\`.`)
            await message.delete()
            return
        }
        let messages: Collection<Message> = new Collection<Message>()
        messages.add(String(messages.size), message)

        messages.add(String(messages.size), await channel.createMessage(`Please enter your Roblox Username.\nSay \`cancel\` if you wish to cancel this prompt.`));
        const filter = (msg) => msg.author.id === message.author.id;
        const filter2 = (msg) => (msg.author.id === message.author.id && (msg.content.startsWith(`done`) || msg.content.startsWith(`cancel`)));
        const filter3 = (msg) => (msg.author.id === message.author.id && (msg.content.toLowerCase().startsWith(`done`) || msg.content.toLowerCase().startsWith(`cancel`) || msg.content.toLowerCase().startsWith(`mobile`)));

        let msgCollector = await channel.awaitMessages({
            timeout: 60000,
            count: 1,
            filter
        })

        const collectedUsername = msgCollector.collected.values().next().value
        if (!collectedUsername) {
            await channel.createMessage(`Prompt timed out.`)
            messages.forEach((m) => {
                m.delete(`Command`)
            })
            return
        }
        messages.add(String(messages.size), collectedUsername)
        if (collectedUsername.content === "cancel") {
            await channel.createMessage(`Prompt cancelled.`)
            messages.forEach((m) => {
                m.delete(`Command`)
            })
            return
        }

        const res = await axios.get(`http://api.roblox.com/users/get-by-username?username=${collectedUsername.content}`);
        const collectedId = res.data.Id;
        if (!collectedId) {
            messages.add(String(messages.size), await channel.createMessage(`Invalid username.\nPlease run the command again.`))
            messages.forEach((m) => {
                m.delete(`Command`)
            })
            return
        }

        let i = 0
        let verifyString = ''
        while (i < 10) {
            const index = Math.floor(Math.random() * this.whitelistedWords.length)
            if (i != 9) {
                verifyString += `${this.whitelistedWords[index]} `
            } else {
                verifyString += `${this.whitelistedWords[index]}`
            }
            i++
        }
        const codeEmbed = new RichEmbed()
        codeEmbed.setAuthor(`${message.member.username}#${message.member.discriminator}`, message.member.avatarURL)
        codeEmbed.setTitle(`Verification Code`)
        codeEmbed.setDescription(`Put the following code into your Roblox account's bio or status.\n\`${verifyString}\`\nWhen you are done, reply with "done"\nIf you are on mobile, reply with "mobile" to get the code in a plain-text message.`)
        codeEmbed.setFooter(`Foundation Management Systems`)
        codeEmbed.setTimestamp()
        messages.add(String(messages.size), await channel.createMessage({ embed: codeEmbed }))

        msgCollector = await channel.awaitMessages({
            timeout: 60000,
            count: 1,
            filter: filter3
        })
        const collectedCodeResponse = msgCollector.collected.values().next().value
        if (!collectedCodeResponse) {
            await channel.createMessage(`Prompt timed out.`)
            messages.forEach((m) => {
                m.delete(`Command`)
            })
            return
        }
        messages.add(String(messages.size), collectedCodeResponse)
        if (collectedCodeResponse.content === "cancel") {
            await channel.createMessage(`Prompt cancelled.`)
            messages.forEach((m) => {
                m.delete(`Command`)
            })
            return
        }
        if (collectedCodeResponse.content === "mobile") {
            messages.add(String(messages.size), await channel.createMessage(verifyString))
            messages.add(String(messages.size), await channel.createMessage(`Once done, reply with "done"`))

            msgCollector = await channel.awaitMessages({
                timeout: 60000,
                count: 1,
                filter: filter2
            })

            const secondResponse = msgCollector.collected.values().next().value
            if (!secondResponse) {
                await channel.createMessage(`Prompt timed out.`)
                messages.forEach((m) => {
                    m.delete(`Command`)
                })
                return
            }
            if (secondResponse.content === "cancel") {
                await channel.createMessage(`Prompt cancelled.`)
                messages.forEach((m) => {
                    m.delete(`Command`)
                })
                return
            }
        }

        const status = await this.checkForCode(verifyString, collectedId)
        if (status) {
            try {
                const newUser = new this.client.db.User({
                    robloxId: collectedId,
                    discordId: message.author.id
                })
                await newUser.save()
                await channel.createMessage(`**Successfully verified \`${message.member.username}#${message.member.discriminator}\` with \`${collectedUsername.content}\`**`)
            } catch (error) {
                await channel.createMessage(`Verification failed.\nPlease try again.`)
            }
        } else {
            await channel.createMessage(`Verification failed.\nPlease try again.`)
        }

        messages.forEach((m) => {
            m.delete(`Command`)
        })
    }

    public async checkForCode(code, userId) {
        const res1 = await axios.get(`https://users.roblox.com/v1/users/${userId}`)
        const res2 = await axios.get(`https://users.roblox.com/v1/users/${userId}/status`)
        const desc = res1.data.description;
        const status = res2.data.status;

        if (desc.includes(code)) return true
        if (status.includes(code)) return true

        return false
    }

    public whitelistedWords = [
        'hippo',
        'cow',
        'pig',
        'fun',
        'cool',
        'egg',
        'dev',
        'developer',
        'call',
        'funny',
        'power',
        'work',
        'worker',
        'president',
        'staff',
        'square',
        'cube',
        'sphere',
        'rectangle',
        'circle',
        'red',
        'yellow',
        'purple',
        'green',
        'blue',
        'teal',
        'pizza',
        'steak',
        'hamburger',
        'build',
        'script',
        'cat',
        'dog',
        'code',
        'arm',
        'tail',
        'head'
    ]
}