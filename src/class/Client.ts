import { Config } from "../../types";
import eris from 'eris';
import pluris from 'pluris';
import mongoose from 'mongoose';
import { Collection, Command, Event, Util } from '.';

import {
    Application, ApplicationInterface,
    Ban, BanInterface,
    Note, NoteInterface,
    Role, RoleInterface,
    User, UserInterface,
    Suspension, SuspensionInterface,
} from '../models';

pluris(eris)

export default class Client extends eris.Client {
    public config: Config;

    public commands: Collection<Command>;

    public events: Collection<Event>;

    public db: {
        Application: mongoose.Model<ApplicationInterface>,
        Ban: mongoose.Model<BanInterface>,
        Note: mongoose.Model<NoteInterface>,
        Role: mongoose.Model<RoleInterface>,
        User: mongoose.Model<UserInterface>,
        Suspension: mongoose.Model<SuspensionInterface>,
    }

    public intervals: Collection<NodeJS.Timeout>;

    // public server: Server

    public util: Util;

    constructor(token: string, options?: eris.ClientOptions) {
        super(token, options);
        this.commands = new Collection<Command>();
        this.events = new Collection<Event>();
        this.db = {
            Application,
            Ban,
            Note,
            Role,
            User,
            Suspension
        }
        this.intervals = new Collection<NodeJS.Timeout>();
        // this.server = new Server(this)
        this.util = new Util(this);

    }

    public async connectDb() {
        await mongoose.connect(this.config.mongoDB,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            poolSize: 50
        });
    }

    public async loadCommands(commandFiles) {
        const cmdFiles = Object.values<typeof Command>(commandFiles);
        for (const cmd of cmdFiles) {
            const comm = new cmd(this);
            if (comm.subcmds.length) {
                for (const C of comm.subcmds) {
                    const Cmd: Command = new C(this)
                    comm.subcommands.add(Cmd.name, Cmd)
                    this.util.signale.success(`Loaded sub-command ${comm.name} ${Cmd.name}`)
                }
            }
            delete comm.subcmds;
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