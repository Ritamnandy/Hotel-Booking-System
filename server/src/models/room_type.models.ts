import mongoose from "mongoose";
import type { Document, Types } from "mongoose";
import { Room_Type } from "../constants.js";



interface IRoomType extends Document
{
    name: string,
    hotel: Types.ObjectId,
    description: string,
    price: number,
    photos: string[],
    totalRooms: number
}

const roomSchema = new mongoose.Schema( {
    roomType: {
        type: String,
        enum: Room_Type,
        required: true,
        trim: true,
        index: true
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    photos: [
        {
            type: String,
            default: ""
        }
    ]
}, { timestamps: true } )


const RoomType = mongoose.model<IRoomType>( "RoomType", roomSchema )
export { RoomType }
export type { IRoomType }