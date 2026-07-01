
import { body, param } from "express-validator"

const registerValidation = () =>
{
    return [
        body( "firstName" )
            .trim()
            .notEmpty()
            .withMessage( "First name is required" )
            .isLength( { min: 4 } )
            .withMessage( "First name must be at least 4 characters long" ).isString()
            .withMessage( "First name must be a string" ),
        body( "lastName" )
            .trim()
            .notEmpty()
            .withMessage( "Last name is required" )
            .isLength( { min: 4 } )
            .withMessage( "First name must be at least 4 characters long" ).isString()
            .withMessage( "First name must be a string" ),
        body( "email" )
            .trim()
            .notEmpty()
            .withMessage( "Email is required" )
            .isEmail()
            .withMessage( "Email is not valid" )
            .normalizeEmail()
            .withMessage( "Email is not valid" ),
        body( "password" )
            .trim()
            .notEmpty()
            .withMessage( "Password is required" )
            .isStrongPassword( {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            } )
            .withMessage( "Password must be at least 6 characters long" )
            .isString()
            .withMessage( "Password must be a string" ),
        body( "phoneNo" )
            .trim()
            .notEmpty()
            .withMessage( "Phone number is required" )
            .isLength( { min: 10 } )
            .withMessage( "Phone number must be at least 10 characters long" )
            .isString()
            .withMessage( "Phone number must be a string" )
            .matches( /^[6-9]\d{9}$/ )
            .withMessage( "Phone number is not valid" )
    ]
}

const verifyEmailValidation = () =>
{
    return [
        body( "email" )
            .trim()
            .notEmpty()
            .withMessage( "Email is required" )
            .isEmail()
            .withMessage( "Email is not valid" )
            .normalizeEmail()
            .withMessage( "Email is not valid" ),
        body( "otp" )
            .trim()
            .notEmpty()
            .withMessage( "OTP is required" )
            .isLength( { min: 6, max: 6 } )
            .withMessage( "OTP must be at least 6 characters long" )
            .isString()
            .withMessage( "OTP must be a string" )
    ]
}

const loginValidation = () =>
{
    return [
        body( "email" )
            .notEmpty()
            .withMessage( "Email is required" )
            .isEmail()
            .withMessage( "Email is not valid" )
            .normalizeEmail()
            .withMessage( "Email is not valid" ),
        body( "password" )
            .notEmpty()
            .withMessage( "Password is required" )
            .isLength( { min: 6 } )
            .withMessage( "Password must be at least 6 characters long" )
            .isString()
            .withMessage( "Password must be a string" )
    ]
}

export { registerValidation, verifyEmailValidation, loginValidation }