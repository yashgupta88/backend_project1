// to verify user is there or not 

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv"
import 'dotenv/config'
import { User } from "../models/user.model.js";


export const verifyJWT=asyncHandler(async(req,_,next)=>{  // middleware likhte waqt next likhna
    // res ka koi use nhi tha isliye uski jgh "_" likh diya 
    // production me asia hi hota hai 

   try {
     // ho sakta hai cookies na aa rhe ho , aur ho sakta hai user hi custom header bhej rha ho 
     // jisme token ho , aksar aise mobile application me hota hai 
     // toh header me , req.header("Authorization") se hum token accesss karte hai 
     // Postman pe bhi hum custom headers bhej sakte hai , same cookie ka hi work hota hai 
     // Postman me header me jake key-> Authorization and value ->  Bearer <Token>  de sakte hai 
     // we have to remove Bearer from token to grt it 
 
     const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
     
     if(!token){
         throw new ApiError(401 , "Unauthorized request")
     }
     
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) // this verifies that access token is created by given id 
 
     const user = await User.findById(decodedToken?._id).select( // because we had given _id while writing jwt.sign
         "-password -refreshToken"
     )  
 
     if(!user){ // it is possible that there is access token but user is deleted from database
        
         throw new ApiError(401,"Invalid Access Token")
     }
 
     req.user=user;
     next();
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token")
   }

}) 


/**
  Access token and refresh token mainly isliye hote hai ki user ko baar baar apna email or password nhi dena pade , access token short lived hota like 1 day 
  agar access token expire ho gya hai 

  is case me frontend wala ye kar sakta hai , ya toh wo ye bol sakta hai user ko ki firse lohin karo 
  
  ya phir ek end point ko hit karo aur waha se apna access token refresh karwa lo , naya access token mil jaega 
  is request me apna refresh token deke bhejo , vo hum apne database se match karenge agar , same hua toh hum dubara se session start kar denge ,
  aur hum apko naya access token bhi de denge aur chahe toh refresh token ko bhi nya de denge cookies me 

  // so hume ek new end point create karna hoga ki ispe aake apna access token refresh kara lo 


  
 */