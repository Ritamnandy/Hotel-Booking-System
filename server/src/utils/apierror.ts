
class ApiError extends Error
{
    private statusCode: number
    private error: string[]
    private success: boolean
    private data: null
    stack?: string
    constructor ( statusCode: number, message: string, error: string[], stack: string = "" )
    {
        super( message )
        this.statusCode = statusCode
        this.error = error
        this.success = false
        this.data = null
        if ( stack )
        {
            this.stack = stack
        } else
        {
            Error.captureStackTrace( this, this.constructor )
        }
    }
}

export { ApiError }