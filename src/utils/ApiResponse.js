//   utility for reponse in express

class ApiResponse {
    constructor(statusCode , data , message = "Success"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode<400   // for response 

//   HTTP response status codes indicate whether a specific HTTP request has been successfully completed. Responses are grouped in five classes:

// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)
    }
}

export { ApiResponse }