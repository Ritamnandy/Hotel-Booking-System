import express from "express"
import expressScssion from "express-session"
import cors from "cors"
import cookieParser from "cookie-parser"
import compression from "compression"
import passport from "passport"
import requestIp from 'request-ip';

const app = express()

app.use( compression() )
app.use( express.json( { limit: '20kb' } ) );
app.use( express.urlencoded( { extended: true, limit: '20kb' } ) )
app.use( express.static( 'public' ) )
app.use( cookieParser() )
app.use( cors( {
    origin: process.env.CORS_ORIGIN as string,
    credentials: true
} ) )
app.use( requestIp.mw() )

app.use( expressScssion( {
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
} ) )

app.use( passport.initialize() )
app.use( passport.session() )




export default app