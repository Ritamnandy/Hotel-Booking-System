
import { Redis } from "ioredis";




export const connectRedis = async () =>
{
    try
    {
        const redis = new Redis( process.env.REDIS_URL as string )
        redis.on( "connect", () =>
        {
            console.log( "redis connected" )
        } )
    } catch ( error )
    {
        if ( error instanceof Error )
        {
            throw new Error( error.message )
        } else
        {
            throw new Error( "Something went wrong,when connecting to redis" )
        }
    }
}