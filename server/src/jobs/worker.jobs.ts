
import { Worker } from "bullmq";
import { sendVerificationEmail } from "../utils/mail.js";

const connection = {
    host: process.env.REDIS_HOST as string,
    port: process.env.REDIS_PORT as unknown as number
}


const redisWorker = new Worker( "TaskQueue", async ( job ) =>
{
    if ( job.name === "send-verification-email" )
    {
        const { email, userName, code } = job.data
        await sendVerificationEmail( email, userName, code )
    }
}, { connection } )

redisWorker.on( "error", ( error ) =>
{
    console.log( error )
} )

redisWorker.on( "completed", ( job ) =>
{
    console.log( `Job ${ job.id } completed` )
} )