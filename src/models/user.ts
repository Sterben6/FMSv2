import { Schema, model, Document } from 'mongoose';
export interface UserInterface extends Document {
    robloxId: string,
    discordId: string
}
const User: Schema = new Schema({
    robloxId: String,
    discordId: String
})

export default model<UserInterface>('User', User);