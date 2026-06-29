
import './config/env.config.js'
import app from './app.js'
import { connectDB } from './db/connect.db.js'
import { connectRedis } from './db/redis.db.js'

const port = process.env.PORT as unknown as number || 3000



const startServer = async () =>
{
    try
    {
        await connectDB()
        connectRedis()
        app.listen( port, () =>
        {
            console.log( `Server is started on http://localhost:${ port }` )
        } )
    } catch ( error )
    {
        if ( error instanceof Error )
        {
            throw new Error( error.message )
        } else
        {
            throw new Error( "Something went wrong,when starting server" )
        }
    }
}
startServer()