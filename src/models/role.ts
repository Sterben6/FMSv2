import { Document, Schema, model } from 'mongoose';

export interface RoleInterface extends Document {
    key: string,
    roleId: string,
    permission: number,
    description?: string
}

const Role: Schema = new Schema({
    userId: String,
    text: String,
    issuerId: String,
})

export default model<RoleInterface>('Roles', Role)