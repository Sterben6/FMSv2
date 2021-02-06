import { Document, Schema, model } from 'mongoose';

export interface RoleInterface extends Document {
    key: string,
    roleId: string,
    permission: number,
    description?: string
}

const Role: Schema = new Schema({
    key: String,
    roleId: String,
    permission: Number,
    description: String,
})

export default model<RoleInterface>('Roles', Role)