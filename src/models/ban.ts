import { Document, Schema, model } from 'mongoose';

export interface BanInterface extends Document {
    userId: string,
    reason: string,
    date: Date,
    expiration?: {
        date: string,
        processed: boolean
    },
    moderator: string,
    caseId: string
}

const Ban: Schema = new Schema({
    userId: String,
    reason: String,
    date: Date,
    expiration: {
        date: String,
        processed: Boolean,
    },
    moderator: String,
    caseId: String
})

export default model<BanInterface>('Bans', Ban)