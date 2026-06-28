import mongoose from "mongoose";
import type { Document, Types } from "mongoose";

interface IAmenity extends Document
{
    name: string;
    hotelId: Types.ObjectId;
    icon: string;
}
const amenitySchema = new mongoose.Schema<IAmenity>( {
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    icon: {
        type: String,
        default: "",
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true
    }
}, { timestamps: true } );


const Amenity = mongoose.model<IAmenity>( "Amenity", amenitySchema )
export { Amenity }
export type { IAmenity }