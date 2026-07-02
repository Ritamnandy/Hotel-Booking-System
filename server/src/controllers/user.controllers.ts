
import { User } from "../models/auth/user.models.js";
import type { Iuser } from "../models/auth/user.models.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { UserRole } from "../constants.js";
import { redis } from "../db/redis.db.js";
import { redisQueue } from "../jobs/queue.jobs.js";
import crypto from "crypto";
import { uploadImage } from "../utils/cloudinary.js";

const algorithm: string = process.env.ENCRYPTION_ALGORITHM as string;






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

const generateOtp = (): string =>
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

    const rowUser: string | null = await redis.get( signUpKey( email ) );
    if ( !rowUser )
    {
        return res.status( 400 ).json( new ApiError( 400, "User not found", [ "User not found" ] ) )
    }
    const pendingUser: IuserData = JSON.parse( rowUser as string )
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
    email: string,
    phoneNo: string,
    password: string
}


const verifyEmail = asyncHandler( async ( req, res ) =>
{
    const { email, otp } = req.body as verifyEmailBody

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

    const userData: IuserData = JSON.parse( rowdata as string )
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

    const responseUser = user.toObject()
    delete responseUser.password
    delete responseUser.refreshToken
    delete responseUser.googleId
    delete responseUser.phoneNo
    delete responseUser.logintype;

    await redis.del( otpKey( email ) )
    await redis.del( signUpKey( email ) )
    res.status( 200 )
        .cookie( "accessToken", accessToken, options )
        .cookie( "refreshToken", refreshToken, options )
        .json( new ApiResponse( 200, "Email verified successfully", [ "Email verified successfully", { user: responseUser, accessToken: accessToken, refreshToken: refreshToken } ] ) )
} )


// login user

interface loginBody
{
    email: string,
    password: string
}

const loginUser = asyncHandler( async ( req, res ) =>
{
    const { email, password } = req.body as loginBody
    const user: Iuser | null = await User.findOne( { email } )
    if ( !user )
    {
        return res.status( 401 ).json( new ApiError( 401, "Invalid email or password", [ "Invalid email or password" ] ) )
    }
    const checkPassword = await user.comparePassword( password )
    if ( !checkPassword )
    {
        return res.status( 401 ).json( new ApiError( 401, "Invalid email or password", [ "Invalid email or password" ] ) )
    }
    const { accessToken, refreshToken } = await generateTokenPair( user )
    if ( !accessToken || !refreshToken )
    {
        return res.status( 500 ).json( new ApiError( 500, "Token not created", [ "Token not created or  internal server error" ] ) )
    }

    const responseUser = user.toObject()
    delete responseUser.password
    delete responseUser.refreshToken
    delete responseUser.googleId
    delete responseUser.phoneNo
    delete responseUser.logintype;
    res.status( 200 )
        .cookie( "accessToken", accessToken, options )
        .cookie( "refreshToken", refreshToken, options )
        .json( new ApiResponse( 200, "login successfully", [ "login successfully", { user: responseUser, accessToken: accessToken, refreshToken: refreshToken } ] ) )
} )


//logout user 

const logoutUser = asyncHandler( async ( req, res ) =>
{
    const user: Iuser | undefined = req.user as Iuser
    if ( !user )
    {
        return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "unauthorized request, user not found" ] ) )
    }
    user.refreshToken = ""
    await user.save( { validateBeforeSave: false } )
    res.status( 200 )
        .clearCookie( "accessToken", options )
        .clearCookie( "refreshToken", options )
        .json( new ApiResponse( 200, "Logged out successfully", [ "Logged out successfully" ] ) )
} )

// set avatar 

const setAvatar = asyncHandler( async ( req, res ) =>
{
    const avatarPath: string | undefined = req.file?.path
    const user: Iuser | undefined = req.user as Iuser
    console.log( avatarPath );

    if ( !user )
    {
        return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "unauthorized request, user not found" ] ) )
    }
    if ( !avatarPath )
    {
        return res.status( 400 ).json( new ApiError( 400, "Avatar not found", [ "Avatar not found" ] ) )
    }
    const imageUrl = await uploadImage( avatarPath )
    if ( !imageUrl )
    {
        return res.status( 400 ).json( new ApiError( 400, "Avatar not uploaded", [ "Avatar not uploaded" ] ) )
    }
    user.avatar = imageUrl
    await user.save( { validateBeforeSave: false } )
    res.status( 200 ).json( new ApiResponse( 200, "Avatar set successfully", [ "Avatar set successfully", { avatar: imageUrl } ] ) )

} )


// forget password
interface forgetPasswordBody
{
    email: string
}
const forgetPassword = asyncHandler( async ( req, res ) =>
{
    const { email } = req.body as forgetPasswordBody
    if ( !email )
    {
        return res.status( 400 ).json( new ApiError( 400, "Email is required", [ "Email is required" ] ) )
    }
    const user: Iuser | null = await User.findOne( { email } )
    if ( !user )
    {
        return res.status( 404 ).json( new ApiError( 404, "User not found", [ "If an account exists, a password reset link has been sent." ] ) )
    }
    const resetToken = crypto.randomBytes( 32 ).toString( "hex" );

    const hashedToken = crypto
        .createHash( algorithm as string )
        .update( resetToken )
        .digest( "hex" );


    await redis.set( `password-reset:${ hashedToken }`, user._id.toString(), "EX", 60 * 15 )
    const resetUrl = `${ process.env.CLIENT_URL as string }/api/v1/auth/reset-password/${ resetToken }`;
    await redisQueue.add( "send-reset-password-email",
        {
            email,
            userName: `${ user.firstName } ${ user.lastName }`,
            link: resetUrl
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
    return res.status( 200 ).json( new ApiResponse( 200, "Password reset link sent", [ "If an account exists, a password reset link has been sent." ] ) )
} )

// reset password
interface resetPasswordBody
{
    password: string | undefined
}
const resetPassword = asyncHandler( async ( req, res ) =>
{
    const { password } = req.body as resetPasswordBody
    const { token } = req.params
    if ( !token )
    {
        return res.status( 400 ).json( new ApiError( 400, "Token is required", [ "Token is required" ] ) )
    }
    if ( !password )
    {
        return res.status( 400 ).json( new ApiError( 400, "Password is required", [ "Password is required" ] ) )
    }

    const hashedToken = crypto
        .createHash( algorithm as string )
        .update( token as string )
        .digest( "hex" );

    const userId = await redis.get( `password-reset:${ hashedToken }` );
    if ( !userId )
    {
        return res.status( 400 ).json(
            new ApiError( 400, "Invalid or expired token", [] )
        );
    }
    const user: Iuser | null = await User.findById( userId );

    if ( !user )
    {
        return res.status( 404 ).json(
            new ApiError( 404, "User not found", [ "User not found" ] )
        );
    }
    user.password = password
    await user.save( { validateBeforeSave: false } )
    await redis.del( `password-reset:${ hashedToken }` );
    return res.status( 200 ).json( new ApiResponse( 200, "Password reset successfully", [ "Password reset successfully" ] ) )
} )


// social login
const socialLogin = asyncHandler( async ( req, res ) =>
{
    const user: Iuser | undefined = req.user as Iuser
    if ( !user )
    {
        return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "unauthorized request, user not found" ] ) )
    }
    const { accessToken, refreshToken } = await generateTokenPair( user )
    if ( !accessToken || !refreshToken )
    {
        return res.status( 500 ).json( new ApiError( 500, "Token not created", [ "Token not created or  internal server error" ] ) )
    }

    const responseUser = user.toObject()
    delete responseUser.password
    delete responseUser.refreshToken
    delete responseUser.googleId
    delete responseUser.phoneNo
    delete responseUser.logintype;
    res.status( 200 )
        .cookie( "accessToken", accessToken, options )
        .cookie( "refreshToken", refreshToken, options )
        .json( new ApiResponse( 200, "user login successfully", [ "user login successfully", { user: responseUser, accessToken: accessToken, refreshToken: refreshToken } ] ) )
} )


const getUserDetails = asyncHandler( async ( req, res ) =>
{
    const user: Iuser | null = req.user as Iuser
    if ( !user )
    {
        return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "unauthorized request, user not found" ] ) )
    }
    const responseUser = user.toObject()
    delete responseUser.password
    delete responseUser.refreshToken
    delete responseUser.googleId
    delete responseUser.phoneNo
    delete responseUser.logintype;
    res.status( 200 ).json( new ApiResponse( 200, "user details", [ "user details", { user: responseUser } ] ) )
} )





export
{
    registerUser,
    verifyEmail,
    resendOtp,
    loginUser,
    logoutUser,
    setAvatar,
    forgetPassword,
    resetPassword,
    socialLogin,
    getUserDetails
}