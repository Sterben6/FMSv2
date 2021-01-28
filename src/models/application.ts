import { Document, Schema, model} from "mongoose";

export interface ApplicationInterface extends Document {
    userId: string,
    questions: Map<string, string>,
    comments: Map<string, string>,
    date: Date,
    /**
     * @field 0 - Unread
     * @field 1 - Denied
     * @field 2 - Accepted
     * @field 3 - Pending
     */
    status: 0 | 1 | 2 | 3,
    /**
     * @field 1 - L1
     * @field 2 - L2
     * @field 3 - EATS
     * @field 4 - SCD
     * @field 5 - DEA
     * @field 6 - SC
     */
    type: 1 | 2 | 3 | 4 | 5 | 6,
    id: string
}

const Application: Schema = new Schema({
    userId: String,
    questions: Map,
    comments: Map,
    date: Date,
    status: Number,
    type: Number,
    id: String,
})

export default model<ApplicationInterface>('Applications', Application);