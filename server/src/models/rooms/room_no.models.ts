import mongoose from "mongoose";
import type { Document, Types } from "mongoose";
import { Room_status } from "../../constants.js";
interface IRoomNo extends Document {
    roomno: string;
    hotel: Types.ObjectId;
    roomType: Types.ObjectId;
    floor: number;
    status: string;
}

const roomNoSchema = new mongoose.Schema<IRoomNo>( {
    roomno: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true
    },
    roomType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoomType",
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: Room_status,
        required: true
    }
}, { timestamps: true } );


const RoomNumber = mongoose.model<IRoomNo>( "RoomNumber", roomNoSchema )
export { RoomNumber }
export type { IRoomNo }