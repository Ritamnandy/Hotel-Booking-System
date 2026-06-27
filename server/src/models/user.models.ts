
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import type { SignOptions, Secret } from "jsonwebtoken"
import { Document } from "mongoose";

interface Iuser extends Document
{
    firstName: string,
    lastName: string,
    email: string,
    phoneNo: string,
    password: string,
    role: string,
    googleId: string,
    isVerified: boolean,
    avatar: string,
    address: mongoose.Schema<Iaddress>,
    refreshToken: string,
    createdAt: Date,
    getPhoneNumber: () => string,
    comparePassword:()=>Promise<boolean>,
    generateAccessToken: () => string,
    generateRefreshToken: () => string,
    updatedAt: Date
}

interface Iaddress extends Document
{
    country: string,
    state: string,
    city: string,
    pincode: string
}

const addressSchema = new mongoose.Schema<Iaddress>( {
    country: {
        type: String,
        default: "",
        trim: true
    },
    state: {
        type: String,
        default: "",
        trim: true
    },
    city: {
        type: String,
        default: "",
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        match: [ /^\d{6}$/, "Invalid  PIN code" ]
    }
}, { timestamps: true } )


const userSchema = new mongoose.Schema<Iuser>( {
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phoneNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 10,
        match: [ /^[6-9]\d{9}$/, "Please enter a valid mobile number" ],
    },
    password: {
        type: String,
        default: "",
        trim: true
    },
    googleId: {
        type: String,
        default: "",
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: ""
    },
    address: {
        type: addressSchema
    },
    refreshToken: {
        type: String,
        default: ""
    }
}, { timestamps: true } )

userSchema.pre( "save", async function ()
{
    if ( !this.isModified( "password" ) ) return
    this.password = await bcrypt.hash( this.password, 10 )
} )

const algorithm:string = process.env.ENCRYPTION_ALGORITHM as string;
const key:string = process.env.ENCRYPTION_KEY as string;
const iv: string = process.env.ENCRYPTION_IV as string;

userSchema.pre( "save", function ()
{
    const cipher = crypto.createCipheriv( algorithm, key, iv )
    let encrypted = cipher.update( this.password, "utf8", "hex" )
    encrypted += cipher.final( "hex" )
    this.password = encrypted
})


userSchema.methods.getPhoneNumber = function ()
{
    const decipher = crypto.createCipheriv( algorithm, key, iv )
    let decrypted = decipher.update( this.phoneNo, "hex", "utf8" )
    decrypted += decipher.final( "utf8" )
    return decrypted
}



userSchema.methods.comparePassword = async function ( password: string ): Promise<boolean>
{
    return await bcrypt.compare( password, this.password )
}

const AccessTokenSecret: string = process.env.JWT_SECRET as string
const AccessTokenExpiresIn: string = process.env.JWT_TOKEN_EXPIRES_IN as string


userSchema.methods.generateAccessToken = function ()
{
    return jwt.sign(
        {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            role: this.role
        },
        AccessTokenSecret as Secret,
        {
            expiresIn: AccessTokenExpiresIn
        } as SignOptions
    )
}

const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET as string
const refreshTokenExpiresIn: string = process.env.REFRESH_TOKEN_EXPIRES_IN as string


userSchema.methods.generateRefreshToken = function ()
{
    return jwt.sign(
        {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            role: this.role
        },
        refreshTokenSecret as Secret,
        {
            expiresIn: refreshTokenExpiresIn
        } as SignOptions
    )
}


const User = mongoose.model<Iuser>( "User", userSchema )

export { User };
export type { Iuser };
