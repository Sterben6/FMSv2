import { Client } from '../class';
import noblox from 'noblox.js';

let interval: NodeJS.Timeout;

export default function suspensionCheck(client: Client): NodeJS.Timeout {
    interval = setInterval(async () => {
        try {
            const suspensions = await client.db.Suspension.find();
            for (const suspension of suspensions) {
                if (!suspension.expiration) continue;
                if (suspension.expiration.processed) continue;
                if (new Date() > suspension.expiration.date) {
                    await suspension.updateOne({ 'expiration.processed': true});

                }
            }
        } catch(error) {
            await client.util.handleError(error)
        }
    }, 30000)
    return interval;
}