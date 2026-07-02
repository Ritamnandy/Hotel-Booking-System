
import multer, { type FileFilterCallback } from "multer"
import type { Request, Response, NextFunction } from "express"

const storage = multer.diskStorage( {
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb
    ) =>
    {
        cb( null, "/src/public/" );
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb
    ) =>
    {
        cb( null, file.originalname );
    }
} );


const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) =>
{
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
    ];

    if ( allowedMimeTypes.includes( file.mimetype ) )
    {
        cb( null, true );
    } else
    {
        cb( new Error( "Invalid file type" ) );
    }
};




export const upload = multer(
    {
        storage: storage,
        fileFilter,
        limits: {
            fileSize: 1024 * 1024 * 5
        }
    } )