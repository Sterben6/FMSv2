import { Document, Schema, model } from 'mongoose';

export interface SuspensionInterface extends Document {
    userId: string,
    reason: string,
    issuerId: string,
    date: Date,
    expiration?: {
        date: Date,
        processed: boolean
    }
}

const Suspension: Schema = new Schema({
    userId: String,
    reason: String,
    issuerId: String,
    date: Date,
    expiration: {
        date: Date,
        processed: Boolean
    }
})

export default model<SuspensionInterface>('Suspensions', Suspension)