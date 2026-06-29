
import { v2 as cloudinary } from 'cloudinary'
import fs from "node:fs"


cloudinary.config( {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
} )

const uploadImage = async ( path: string | null ) =>
{
    if ( !path )
    {
        return null
    }
    try
    {
        const response = await cloudinary.uploader.upload( path, {
            resource_type: "auto"
        } )
        fs.unlinkSync( path )
        return response.url
    } catch ( error )
    {
        fs.unlinkSync( path )
        if ( error instanceof Error )
        {
            throw new Error( error.message )
        } else
        {
            throw new Error( "Something went wrong,when uploading image to cloudinary" )
        }
    }
}


export { uploadImage }