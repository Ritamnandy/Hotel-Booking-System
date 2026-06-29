
import mongoose from "mongoose";
import { Db_Name } from "../constants.js";

export const connectDB = async () =>
{
    try
    {
        const response = await mongoose.connect( `${ process.env.MONGO_URL as string }/${ Db_Name }` )
        console.log( 'mongodb connect on:- ' + response.connection.host );

    } catch ( error )
    {
        if ( error instanceof Error )
        {
            throw new Error( error.message )
        } else
        {
            throw new Error( "Something went wrong,when connecting to database" )
        }
    }
}

