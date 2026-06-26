//  main logic wala part hota hai controller , how to write controller ,
// jitna jyada controller likhenge , badi problems ko chote chote me todenge , utna hi logic building acha hoga 

import { asyncHandler } from "../utils/asyncHandler.js";

// method for registering user 
// as we know that whenever we make an app from express we get four parameter out of 
// which two are (req , res)

const registerUser = asyncHandler(async (req , res)=>{  // takes an function
    res.status(500).json({
        message:"Chai aur Code "
    })
})

export {registerUser}