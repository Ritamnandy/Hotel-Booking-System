
class ApiResponse
{
    private message: string
    private data: ( string | object )[]
    private statusCode: number
    private success: boolean
    private error: null

    constructor ( statusCode: number, message: string, data: ( string | object )[], )
    {
        this.data = data
        this.message = message
        this.error = null
        this.statusCode = statusCode
        this.success = statusCode < 400
    }
}

export { ApiResponse }