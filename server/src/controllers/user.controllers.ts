
import { User } from "../models/auth/user.models.js";
import type { Iuser } from "../models/auth/user.models.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { UserRole } from "../constants.js";
import { redis } from "../db/redis.db.js";
import { redisQueue } from "../jobs/queue.jobs.js";
import crypto from "crypto";


const generateTokenPair = async ( userData: Iuser ) =>
{
    try
    {
        const accessToken = userData.generateAccessToken()
        const refreshToken = userData.generateRefreshToken()
        if ( !accessToken || !refreshToken )
        {
            return {
                accessToken: null,
                refreshToken: null
            }
        }
        userData.refreshToken = refreshToken
        await userData.save( { validateBeforeSave: false } )
        return {
            accessToken,
            refreshToken
        }
    } catch ( error )
    {
        if ( error instanceof Error )
        {
            throw new Error( error.message )
        } else
        {
            throw new Error( "Something went wrong,when generating token pair" )
        }
    }
}

const options = {
    httpOnly: true,
    secure: true,
    maxAge: 5 * 60 * 60 * 1000
}

const otpKey = ( email: string ) => `otp:${ email }`
const signUpKey = ( email: string ) => `user:signup:${ email }`

const generateOtp = () =>
{
    const otp = crypto.randomInt( 100000, 1000000 ).toString();
    return otp
}




//register user

interface registerBody
{
    firstName: string,
    lastName: string
    email: string,
    phoneNo: string,
    password: string
}

const registerUser = asyncHandler( async ( req, res ) =>
{
    const { firstName, lastName, email, phoneNo, password } = req.body as registerBody
    if ( !firstName || !lastName || !email || !phoneNo || !password )
    {
        return res.status( 400 ).json( new ApiError( 400, "All fields are required", [ "All fields are required" ] ) )
    }
    const existingUser: Iuser | null = await User.findOne( { email } )
    if ( existingUser )
    {
        return res.status( 400 ).json( new ApiError( 400, "User already exists", [ "User already exists" ] ) )
    }

    const otp = generateOtp()
    await redis.set( otpKey( email ), otp, "EX", 60 * 10 )
    const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNo: phoneNo,
        password: password,
    }
    await redis.set( signUpKey( email ), JSON.stringify( userData ) )
    const job = await redisQueue.add( "send-verification-email",
        {
            email,
            userName: `${ firstName } ${ lastName }`,
            code: otp
        },
        {
            removeOnComplete: true,
            removeOnFail: true,
            attempts: 3,
            backoff: {
                delay: 1000,
                type: "exponential"
            }
        }
    )
    res.status( 201 ).json( new ApiResponse( 201, "User created successfully", [ "Verify your email to activate your account" ] ) )
} )

// resend otp
interface resendEmailBody
{
    email: string
}
const resendOtp = asyncHandler( async ( req, res ) =>
{
    const { email } = req.body as resendEmailBody
    if ( !email || email === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Email is required", [ "Email is required" ] ) )
    }
    const rowUser = await redis.get( signUpKey( email ) );
    if ( !rowUser )
    {
        return res.status( 400 ).json( new ApiError( 400, "User not found", [ "User not found" ] ) )
    }
    const pendingUser: string | null = JSON.parse( rowUser as string )
    if ( !pendingUser )
    {
        return res.status( 400 ).json( new ApiError( 400, "User not found", [ "User not found" ] ) )
    }
    const otp = generateOtp()
    await redis.set( otpKey( email ), otp, "EX", 60 * 10 )
    const job = await redisQueue.add( "send-verification-email",
        {
            email,
            userName: email,
            code: otp
        },
        {
            removeOnComplete: true,
            removeOnFail: true,
            attempts: 3,
            backoff: {
                delay: 1000,
                type: "exponential"
            }
        }
    )
    res.status( 200 ).json( new ApiResponse( 200, "Otp sent successfully", [ "check your email and verify your email" ] ) )
} )


//verify Email

interface verifyEmailBody
{
    email: string,
    otp: string
}
interface IuserData
{
    firstName: string,
    lastName: string,
    phoneNo: string,
    password: string
}


const verifyEmail = asyncHandler( async ( req, res ) =>
{
    const { email, otp } = req.body as verifyEmailBody

    if ( !email || !otp )
    {
        return res.status( 400 ).json( new ApiError( 400, "All fields are required", [ "All fields are required" ] ) )
    }

    const verifiedUser: Iuser | null = await User.findOne( { email } )

    if ( verifiedUser?.isVerified )
    {
        return res.status( 400 ).json( new ApiError( 400, "User already exists", [ "User already exists" ] ) )
    }

    const code = await redis.get( otpKey( email ) )
    if ( !code )
    {
        return res.status( 400 ).json( new ApiError( 400, "Invalid otp", [ "otp is expired or invalid otp" ] ) )
    }
    if ( code !== otp )
    {
        return res.status( 400 ).json( new ApiError( 400, "Invalid otp", [ "Invalid otp" ] ) )
    }

    const rowdata: string | null = await redis.get( signUpKey( email ) )
    if ( !rowdata )
    {
        return res.status( 400 ).json( new ApiError( 400, "User not found", [ "User not found" ] ) )
    }

    const userData = JSON.parse( rowdata as string )
    if ( !userData )
    {
        return res.status( 400 ).json( new ApiError( 400, "User not found", [ "User not found" ] ) )
    }

    const { firstName, lastName, phoneNo, password } = userData as IuserData
    const user: Iuser | null = await User.create( {
        firstName,
        lastName,
        email,
        phoneNo,
        password,
        role: UserRole.CUSTOMER,
        isVerified: true
    } )
    if ( !user )
    {
        return res.status( 500 ).json( new ApiError( 500, "User not created", [ "User not created or internal server error" ] ) )
    }
    const { accessToken, refreshToken } = await generateTokenPair( user )
    if ( !accessToken || !refreshToken )
    {
        return res.status( 500 ).json( new ApiError( 500, "Token not created", [ "Token not created or  internal server error" ] ) )
    }
    const createdUser: Iuser = await User.findById( user._id ).select( "-password -googleId -logintype -phoneNo -refreshToken" )
    if ( !createdUser )
    {
        return res.status( 500 ).json( new ApiError( 500, "User not found", [ "User not found or internal server error" ] ) )
    }
    await redis.del( otpKey( email ) )
    await redis.del( signUpKey( email ) )
    res.status( 200 )
        .cookie( "accessToken", accessToken, options )
        .cookie( "refreshToken", refreshToken, options )
        .json( new ApiResponse( 200, "Email verified successfully", [ "Email verified successfully", { user: createdUser, accessToken: accessToken, refreshToken: refreshToken } ] ) )
} )