
import nodemailer from "nodemailer"
import mailgen from "mailgen"
import { text } from "node:stream/consumers"


const sendVerificationEmail = async ( email: string, userName: string, code: string ) =>
{
    const config = {
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        }
    }
    const transpoter = nodemailer.createTransport( config )
    const mailGenerator = new mailgen( {
        theme: "default",
        product: {
            name: "Email Verification",
            link: "https://www.google.com"
        }
    } )
    const mail = {
        body: {
            name: userName,
            intro: "Welcome to our Booking platform! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email, Use this code:",
                button: {
                    color: "#bc621d",
                    text: code.toString(),
                    link: "#",
                },
            },
            outro: "Code will expire in 5 minutes.\nNeed help, or have questions? Just reply to this email, we\'d love to help.",
        },
    }
    const emailBody = mailGenerator.generate( mail )
    const emailText = mailGenerator.generatePlaintext( mail )
    const mailOption = {
        from: process.env.EMAIL,
        to: email,
        subject: "Email Verification",
        text: emailText,
        html: emailBody
    }
    try
    {
        await transpoter.sendMail( mailOption )
        console.log( 'mail send' );

    } catch ( error )
    {
        if ( error instanceof Error )
        {
            throw new Error( error.message )
        } else
        {
            throw new Error( "mail send failed" )
        }
    }
}

const sendForgetPasswordEmail = async ( email: string, userName: string, url: string ) =>
{
    const config = {
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        }
    }
    const transpoter = nodemailer.createTransport( config )
    const mailGenerator = new mailgen( {
        theme: "default",
        product: {
            name: "Email Verification",
            link: "https://www.google.com"
        }
    } )
    const mail = {
        body: {
            name: userName,
            intro: "Welcome to our Booking platform! We're very excited to have you on board.",
            action: {
                instructions: "To reset your password, Use this link:",
                button: {
                    color: "#bc621d",
                    text: "Click Here",
                    link: url,
                },
            },
            outro: "Code will expire in 15 minutes.\nNeed help, or have questions? Just reply to this email, we\'d love to help.",
        },
    }
    const emailBody = mailGenerator.generate( mail )
    const emailText = mailGenerator.generatePlaintext( mail )
    const mailOption = {
        from: process.env.EMAIL,
        to: email,
        subject: "Reset Password",
        text: emailText,
        html: emailBody
    }
    try
    {
        await transpoter.sendMail( mailOption )
        console.log( 'mail send' );

    } catch ( error )
    {
        if ( error instanceof Error )
        {
            throw new Error( error.message )
        } else
        {
            throw new Error( "mail send failed" )
        }
    }
}

export { sendVerificationEmail, sendForgetPasswordEmail }