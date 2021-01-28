import { Document, Schema, model } from 'mongoose';

export interface NoteInterface extends Document {
    userId: string,
    text: string,
    issuerId: string,
}

const Note: Schema = new Schema({
    userId: String,
    text: String,
    issuerId: String,
})

export default model<NoteInterface>('Notes', Note)