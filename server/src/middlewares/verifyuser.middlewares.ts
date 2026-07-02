
import jwt from "jsonwebtoken"
import type { JwtPayload } from "jsonwebtoken"
import { ApiError } from "../utils/apierror.js"
import { User, type Iuser } from "../models/auth/user.models.js"
import { asyncHandler } from "../utils/asynchandler.js"

interface CustomPayload extends JwtPayload
{
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
}


export const verifyJWT = asyncHandler( async ( req, res, next ) =>
{
    try
    {
        const token: string | undefined = req.cookies.accessToken || req.body.accessToken || req.header( 'Authorization' )?.replace( 'Bearer ', '' )
        if ( !token || token === "" )
        {
            return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "unauthorized request, AccessToken not found" ] ) )
        }
        const decodedToken: CustomPayload = jwt.verify( token, process.env.JWT_TOKEN_SECRET as string ) as CustomPayload
        const user: Iuser | null = await User.findById( decodedToken?._id )
        if ( !user || user === null )
        {
            return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "unauthorized request, user not found" ] ) )
        }

        (req.user) = user as Iuser

        next()

    } catch ( error )
    {
        if ( error instanceof Error )
        {
            next( error.message )
        } else
        {
            throw new Error( "Something went wrong,when verifying user" )
        }
    }
} )