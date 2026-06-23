// these are utilities made for removal repetitive use of code , and these are used as template for further work 


const asyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err))
        // next is a callback function that acts like a traffic controller signal , it tells Express to stop executing the current function and move on to the next piece of code in line 
        // Note---> resolve and reject are used while creation of a promise and then and catch are used while consuming a promise 
    }
}

export {asyncHandler}


// using async await
/*
a higher order function are usually a function which takes function as input or either return function as output
 */

// const asyncHandler=()=>{}  // normal function
// const asyncHandler=(func)=>{()=>{}} // taking function as a parameter and also returning a function 
// // now we can remove this curly braces
// const asyncHandler=(func)=>()=>{}
// // to make return function async
// const asyncHandler=(func)=>async()=>{}

// const asyncHandler=(fn) => async(req,res,next)=>{    basically returning async(req,res,next){...} function
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({ // we can also send json response to user 
//             success:false, // for user , succes flag tell process is success or not 
//             message:error.message  // .message is the builtin Javascript prop extracted from the error object that caught crash
//         })
//     }
// }

// without asyncHandler , we are going to use try..catch in every route , 