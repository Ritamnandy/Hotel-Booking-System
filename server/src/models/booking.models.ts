import mongoose from "mongoose";
import type { Document, Types } from "mongoose";
import { Payment_Status } from "../constants.js";

interface IBooking extends Document
{
    bookingNumber: string,
    user: Types.ObjectId,
    hotel: Types.ObjectId,
    roomType: Types.ObjectId,
    room: Types.ObjectId,
    payment: Types.ObjectId,
    checkIn: Date,
    checkOut: Date,
    adults: number,
    children: number,
    totalPrice: number,
    paymentStatus: string,
    roomNo: Types.ObjectId
}


const BookingSchema = new mongoose.Schema( {}, { timestamps: true } )

const Booking = mongoose.model("Booking", BookingSchema)
export {Booking}