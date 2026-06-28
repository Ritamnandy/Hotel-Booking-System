import mongoose from "mongoose";
import type { Document, Types } from "mongoose";
import { Payment_Status } from "../../constants.js";

interface IPayment extends Document
{
    paymentId: string,
    bookingId: Types.ObjectId,
    amount: number,
    status: string
    transactionId: string|null
    paidAt: Date|null,
}

const paymentSchema = new mongoose.Schema<IPayment>( {
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min:0
    },
    status: {
        type: String,
        enum: Payment_Status,
        required: true
    },
    transactionId: {
        type: String,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    }
}, { timestamps: true } )

export const Payment = mongoose.model<IPayment>( "Payment", paymentSchema )
export type { IPayment }
