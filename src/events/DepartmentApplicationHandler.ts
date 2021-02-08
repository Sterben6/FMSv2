import { Client, Event } from '../class';
import noblox from 'noblox.js';
import {Member, Message} from "eris";

export default class DepartmentApplicationHandler extends Event {
    public client: Client;

    constructor(client: Client) {
        super(client);
        this.event = 'messageReactionAdd';
    }

    public async run(message: Message, emoji, reactor: Member) {
        const channel = message.channel
        if (!this.departmentChannelList.includes(channel.id)) return;
    }

    public departmentChannelList = [
        '771797732817109002', // EATS
        '772619817152413726', // SCD
        '772666760314748928', // DEA
        '772871941765595206' // SC
    ]
}