import { Config } from "../../types";
import eris from 'eris';
import pluris from 'pluris';
import mongoose from 'mongoose';
import { Collection, Command, Event, Util } from '.';

import {
    User, UserInterface
} from '../models';

pluris(eris)

export default class Client extends eris.Client {
    public config: Config;

    public commands: Collection<Command>;

    public events: Collection<Event>;

    public db: { User: mongoose.Model<UserInterface>}

    public intervals: Collection<NodeJS.Timeout>;

    // public server: Server

    public util: Util;

    constructor(token: string, options?: eris.ClientOptions) {
        super(token, options);
        this.commands = new Collection<Command>();
        this.events = new Collection<Event>();
        this.db = { User }
        this.intervals = new Collection<NodeJS.Timeout>();
        // this.server = new Server(this)
        this.util = new Util(this);

    }

    public async connectDb() {
        await mongoose.connect(this.config.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50 });
    }

    public async loadCommands(commandFiles) {
        const cmdFiles = Object.values<typeof Command>(commandFiles);
        for (const cmd of cmdFiles) {
            const comm = new cmd(this);
            this.commands.add(comm.name, comm);
            this.util.signale.success(`Loaded ${comm.name} command.`)
        }
    }

    public async loadEvents(eventFiles: { ready; CommandHandler; ClearanceApplicationHandler }) {
        const evntFiles = Object.entries<typeof Event>(eventFiles);
        for (const [name, ev] of evntFiles) {
            const event = new ev(this)
            this.events.add(event.event, event);
            this.on(event.event, event.run)
            this.util.signale.success(`Loaded ${name} event.`)
            delete require.cache[require.resolve(`${__dirname}/../events/${name}`)];
        }
    }
}