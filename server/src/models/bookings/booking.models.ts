import mongoose from "mongoose";
import type { Document, Types } from "mongoose";


interface IBooking extends Document
{
    bookingNumber: string,
    userId: Types.ObjectId,
    hotelId: Types.ObjectId,
    roomTypeId: Types.ObjectId,
    roomNoId: Types.ObjectId
    paymentId: Types.ObjectId,
    checkIn: Date,
    checkOut: Date,
    adults: number,
    children: number,
    totalPrice: number,
}


const BookingSchema = new mongoose.Schema<IBooking>( {
    bookingNumber: {
        type: String,
        required: true,
        unique: true
    },
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
    roomTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoomType",
        required: true
    },
    roomNoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoomNo",
        required: true
    }
    ,
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",

    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    adults: {
        type: Number,
        required: true
    },
    children: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },


}, { timestamps: true } )

const Booking = mongoose.model<IBooking>( "Booking", BookingSchema )


export { Booking }

export type { IBooking }

