
import { validationResult } from "express-validator"
import type { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/apierror.js"
export const validate = ( req: Request, res: Response, next: NextFunction ) =>
{
    const errors = validationResult( req )
    if ( !errors.isEmpty() )
    {
        return res.status( 400 ).json( new ApiError( 400, "Validation error", errors.array() ) )
    }
    next()
}