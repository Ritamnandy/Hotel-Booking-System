
import mongoose from "mongoose";
import type { Document, Types } from "mongoose";
import type { Iaddress } from "./user.models.js";
import { addressSchema } from "./user.models.js";



interface Ihotel extends Document
{
    name: string
    owner: Types.ObjectId
    address: Iaddress
    description: string
    photos: string[]
    rating: number
    checkInTime: Date
    checkOutTime: Date
}

const hotelSchema = new mongoose.Schema<Ihotel>( {
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: addressSchema,
    photos: [
        {
            type: String,
            default: ""
        }
    ],
    rating: {
        type: Number,
        required: true,
        index: true,
        default: 0
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: {
        type: Date,
        required: true
    }

}, { timestamps: true } )


export const Hotel = mongoose.model<Ihotel>( "Hotel", hotelSchema );