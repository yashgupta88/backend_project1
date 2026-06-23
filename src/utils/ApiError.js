// Error is a class in node js , read documentation 
//  const err = new Error('The message');
// error class in node js has constructor which takes message 
//  const cause = new Error('The remote HTTP server responded with a 500 status');

//   utility for error messages 


class ApiError extends Error{
    constructor(statusCode,message="Something went wrong",errors=[],stack=""){
        super(message) // overwrites message from parent Error object
       // super  for calling and taking properties of parent object 
        // and message tells what error has been happend
        this.statusCode=statusCode
        this.message=message // no need , already overwritten because in parent class 
        this.data=null
        this.success=false
        this.errors=errors


        if(stack){
            this.stack=stack   // A stack trace is the history of functions calls that led to the error 
            // or it tells , at which part there is error , where did error happen 
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}
export {ApiError}