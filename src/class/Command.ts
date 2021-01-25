import { Member, Message, TextableChannel } from 'eris'
import { Client, Collection } from '.'

export default class Command {
    /**
     * The bot client
     */
    public client: Client;
    /**
     * The name of the command
     */
    public name: string;
    /**
     * The description for the command
     */
    public description: string;
    /**
     * The usage for the command
     */
    public usage: string;
    /**
     * The possible aliases for the command
     */
    public aliases: string[]
    /**
     * - **0:** Global
     * - **1:** L3+
     * - **2:** L4+
     * - **3:** SiD+
     * - **4:** O5+
     * - **5:** Adm
     */
    public permissions: number;
    /**
     * If true, then command cannot be ran in DMs. Default is true
     */
    public guildOnly: boolean;
    /**
     * Internal usage
     */
    public subcommands?: Collection<Command>
    /**
     * Sub-commands for the command, ran as "-command subcommand args"
     */
    public subcmds?: any[]
    /**
     * If false, the command will not be able to be ran. Default is true.
     */
    public enabled: boolean;

    public run(message: Message, args: string[]): Promise<any> { return Promise.resolve() }

    constructor(client: Client) {
        this.client = client;

        this.description = "No description has been provided for this command.";

        this.usage = "No usage has been given for this command."

        this.permissions = 0

        this.guildOnly = true

        this.enabled = true

        this.aliases = [];

        this.subcommands = new Collection<Command>();

        this.subcmds = []
    }

    public checkPermissions(member: Member, perm?: number): boolean {
        if (member.id === "241361691730903040") return true;
        switch (perm || this.permissions) {
            // Global
            case 0:
                return true;
            // L3+
            case 1:
                return member.roles.some((r) => ['744227442817892352', '744227250727288912', '744227055901605928', '744221117748609184', '744220915880951859']);
            // L4+
            case 2:
                return member.roles.some((r) => ['744227250727288912', '744227055901605928', '744221117748609184', '744220915880951859']);
            // SiD+
            case 3:
                return member.roles.some((r) => ['744227055901605928', '744221117748609184', '744220915880951859']);
            // O5+
            case 4:
                return member.roles.some((r) => ['744221117748609184', '744220915880951859']);
            // Adm
            case 5:
                return member.roles.some((r) => ['744220915880951859']);
            default:
                return false;
        }
    }
}