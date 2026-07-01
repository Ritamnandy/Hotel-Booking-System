
import { body, param } from "express-validator"

const registerValidation = () =>
{
    return [
        body( "firstName" )
            .isEmpty()
            .withMessage( "First name is required" )
            .isLength( { min: 4 } )
            .withMessage( "First name must be at least 4 characters long" ).isString()
            .withMessage( "First name must be a string" ),
        body( "lastName" )
            .isEmpty()
            .withMessage( "Last name is required" )
            .isLength( { min: 4 } )
            .withMessage( "First name must be at least 4 characters long" ).isString()
            .withMessage( "First name must be a string" ),
        body( "email" )
            .isEmpty()
            .withMessage( "Email is required" )
            .isEmail()
            .withMessage( "Email is not valid" )
            .normalizeEmail()
            .withMessage( "Email is not valid" ),
        body( "password" )
            .isEmpty()
            .withMessage( "Password is required" )
            .isLength( { min: 6 } )
            .withMessage( "Password must be at least 6 characters long" )
            .isString()
            .withMessage( "Password must be a string" ),
        body( "phoneNo" )
            .isEmpty()
            .withMessage( "Phone number is required" )
            .isLength( { min: 10 } )
            .withMessage( "Phone number must be at least 10 characters long" )
            .isString()
            .withMessage( "Phone number must be a string" )
            .matches( /^[6-9]\d{9}$/, "Please enter a valid mobile number" )
    ]
}


const loginValidation = () =>
{
    return [
        body( "email" )
            .isEmpty()
            .withMessage( "Email is required" )
            .isEmail()
            .withMessage( "Email is not valid" )
            .normalizeEmail()
            .withMessage( "Email is not valid" ),
        body( "password" )
            .isEmpty()
            .withMessage( "Password is required" )
            .isLength( { min: 6 } )
            .withMessage( "Password must be at least 6 characters long" )
            .isString()
            .withMessage( "Password must be a string" )
    ]
}

export { registerValidation, loginValidation }