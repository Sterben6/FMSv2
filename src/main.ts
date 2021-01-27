import { promises as fs } from 'fs';
import { Client } from './class';
import * as eventFiles from './events';
import * as commandFiles from './commands';
import { parse } from 'yaml';
import { Config } from '../types'; // eslint-disable-line
import noblox from 'noblox.js';

async function main(): Promise<void> {
    const read = await fs.readFile(process.cwd() + '/config.json', 'utf8');
    const config: Config = parse(read);
    const client = new Client(config.token, { defaultImageFormat: 'png', restMode: true });
    client.config = config;
    await client.loadEvents(eventFiles);
    await client.loadCommands(commandFiles);
    await client.connectDb()

    await noblox.setCookie(`_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_11A9B3FF903F7721AB9581C8F01381877C1BFB9C29752A3FE1E3FDE088E757FD99029677051A52469786596BA46B1617F57B39AB82DD99AD7FD115CBE1B6EB44C0CD0B963E6088EE35BF3E26C65E1FDCC46D5099CC38579FD2138F29A0FB406B6812ED5ECA8543F28EA1647AC815F3FED2456A7440CA05D0464AF34BC932CA590904D6145D4158601EF769D6C6968EEBCCC169F6CF8CC11A08B0FE8354F58CFA0DB9D72FF378B4CF0702519D8AAE1FF0DB064314D50332AFD7FCDE0DCF3A9FB9B063943F0145F0A5675C3A2566FA09464E205D4BEB34C606DAB956073B0C78C7EA66FAD8A5B56F78BD1CFF58897464B0D96B3BFB34960A9D9563BA40E5F681F1DC1EACB182EBC20E55B0E04C08980A8051926A9B90873D0562ABDA5A7C4CAE8E4787A7F4DBA45E8D40A878531FC8F3FB8E4324E2`)
    await client.connect();

    client.shards.get(0).on(`disconnect`, async function() {
        await this.client.shards.get(0).connect();
    })
}

main();
