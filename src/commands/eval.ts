import axios from 'axios';
import { inspect } from 'util';
import { Message } from 'eris';
import { Client, Command } from '../class';

export default class Eval extends Command {
    constructor(client: Client) {
        super(client);
        this.name = 'eval';
        this.description = 'Evaluates native JS code';
        this.aliases = ['e'];
        this.permissions = 10;
        this.enabled = true;
        this.guildOnly = false;
    }

    public async run(message: Message, args: string[]) {
        try {
            const evalMessage = message.content.slice(this.client.config.prefix.length).trim().split(' ').slice(1);
            let evalString = evalMessage.join(' ').trim();
            let evaled: any;
            let depth = 0;

            if (args[0] && args[0].startsWith('-d')) {
                depth = Number(args[0].replace('-d', ''));
                if (!depth || depth < 0) depth = 0;
                const index = evalMessage.findIndex((v) => v.startsWith('-d')) + 1;
                evalString = evalMessage.slice(index).join(' ').trim();
            }
            if (args[0] === '-a') {
                const index = evalMessage.findIndex((v) => v === '-a') + 1;
                evalString = `(async () => { ${evalMessage.slice(index).join(' ').trim()} })()`;
            }

            try {
                // eslint-disable-next-line no-eval
                evaled = await eval(evalString);
                if (typeof evaled !== 'string') {
                    evaled = inspect(evaled, { depth });
                }
                if (evaled === undefined) {
                    evaled = 'undefined';
                }
            } catch (error) {
                evaled = error.stack;
            }

            evaled = evaled.replace(new RegExp(this.client.config.token, 'gi'), 'juul');
            // evaled = evaled.replace(new RegExp(this.client.config.emailPass, 'gi'), 'juul');
            // evaled = evaled.replace(new RegExp(this.client.config.cloudflare, 'gi'), 'juul');


            const display = this.client.util.splitString(evaled, 1975);
            if (display[5]) {
                try {
                    const { data } = await axios.post('https://snippets.cloud.libraryofcode.org/documents', display.join(''));
                    return message.channel.createMessage(`Your evaluation evaled can be found on https://snippets.cloud.libraryofcode.org/${data.key}`);
                } catch (error) {
                    return message.channel.createMessage(`${error}`);
                }
            }

            return display.forEach((m) => message.channel.createMessage(`\`\`\`js\n${m}\n\`\`\``));
        } catch (err) {
            return
        }
    }
}
