import mongoose from "mongoose";
import { Document, Types } from "mongoose";


interface Ireviews extends Document
{
    userId: Types.ObjectId;
    hotelId: Types.ObjectId;
    rating: number;
    comment: string
}

const reviewsSchema = new mongoose.Schema<Ireviews>( {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true } )

export const Review = mongoose.model<Ireviews>( "Review", reviewsSchema )
export type { Ireviews }