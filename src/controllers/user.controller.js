

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import validator from 'validator';
import {User} from '../models/user.model.js';
import { deleteImageFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import 'dotenv/config'
import mongoose from "mongoose";




const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user=await User.findById(userId); 
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken;
        

       
        await user.save({validateBeforeSave : false}) 
        return {accessToken , refreshToken} 

        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}


const registerUser=asyncHandler(async (req,res)=>{
  


    const {fullName , email , username ,password} = req.body; 
   


    if(
        [fullName,email,username,password].some((field)=>field?.trim()=== "")
    ){
        throw new ApiError(400,"All Fields required ")
    }


   if(!validator.isEmail(email)){   
    throw new ApiError(400 , "Enter valid email")
   }

   if(!validator.isStrongPassword(password)){
    throw new ApiError(400 , "Please enter a strong password.\nMinimum length: 8\nAt least one lowercase letter\nAt least one uppercase letter\nAt least one number\nAt least one symbol" )
   }


   const existedUser =await User.findOne({ 
    $or : [{username} ,{email}] 
   })  

   if(existedUser){
    throw new ApiError(409 , " User with email or username already exists ")
   }  


const avatarLocalPath=req.files?.avatar[0]?.path 


let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    coverImageLocalPath=req.files.coverImage[0].path;
}

if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar file is required ")
}



const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath) 


if(!avatar){
     throw new ApiError(400 , "Avatar file is required ")
}


const user= await User.create({
    fullName,
    avatar : {
        url:avatar.url,
        public_id: avatar.public_id
    },
    coverImage: {
        url : coverImage?.url || "",
        public_id: coverImage?.public_id || "",
    }  , 
    email,
    password,
    username : username.toLowerCase()

})


const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
) 

if(!createdUser){
    throw new ApiError(500 , "Something went wrong while registering the user ")
}



    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered Successfully ")
    )



})

const loginUser=asyncHandler(async (req,res)=>{
  

    const {username,email, password} = req.body;

    if (!username && !email){ 
        throw new ApiError(400,"username or email is required ")

    }
    

   
    const user=await User.findOne(
        {
            $or : [{username},{email}]
        }
    )

    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    const isPasswordValid=await user.isPasswordCorrect(password);
    
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials")
    }

  

    const {accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id)


    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")


    const options={
        httpOnly : true,
        secure : false
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken
              
            },
            "User logged in Successfully"
        )
    )

    

})

const logoutUSer= asyncHandler(async(req,res)=>{


   await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : { 
                refreshToken : 1
            }
        },
        {
            new : true 
        }
    )

    const options={
    
        httpOnly : true,
        secure : false 
        
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged Out")
    )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{

    const incomingRefreshToken=req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ","") || req.body.refreshToken

    if(!incomingRefreshToken){
         throw new ApiError(401 , "Unauthorized access") 
    }

    try {
         const decodedToken=await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
         
    
         if(!decodedToken){
            throw new ApiError(401,"Unauthorized request")
         }
    
        const user=await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used") 
        }
    
         const {accessToken,newRefreshToken} =await generateAccessAndRefreshTokens(user._id)
    
         const options={
          
            httpOnly : true,
            secure : false
        }
    
         return res
         .status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",newrefreshToken,options)
         .json(
              new ApiResponse(
                200,
                {
                  
                    accessToken,
                    refreshToken:newRefreshToken
                },
                "Access token refreshed "
            )
         )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token ")
    }

})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const userId=req.user._id

    const {oldPassword , newPassword} = req.body

    const user=await User.findById(userId)

    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
  throw new ApiError(400,"invalid old Password")
  }

    user.password = newpassword

    await user.save({validateBeforeSave : false}) 
    

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password Changed Successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"current user fetched successfully ")
    )
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
   

    const {fullName,email } = req.body


    if(!fullName || !email) {  
        throw new ApiError(400,"All fields are required ")
    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{ 
            fullName,
            email
          
           
            }
        },
        {
            new:true 
        }
    ) .select("-password -refreshToken")



    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Account Details updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    
    const oldPublicId=req.user.avatar.public_id
    
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
          throw new ApiError(400,"Error while uploading avatar on cloudinary")
    }
    const url=avatar.url
    const public_id=avatar.public_id

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
             $set:{
                avatar :{
                    url,
                    public_id
                }
            }
        },
        {
            new:true
        }
       
    ).select("-password -refreshToken")

    const deletion=await deleteImageFromCloudinary(oldPublicId)
    
    if(!deletion || deletion.result !== "ok"){
         console.error("Failed to delete old avatar:", oldPublicId);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )
})
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    
    const oldPublicId=req.user.coverImage.public_id
    
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image file is missing")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
          throw new ApiError(400,"Error while uploading Cover Image on cloudinary")
    }
    const url=coverImage.url
    const public_id=coverImage.public_id

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
             $set:{
            coverImage:{
                url,
                public_id
            }
        }
        },
        {
            new:true
        }
       
    ).select("-password -refreshToken")

    const deletion=await deleteImageFromCloudinary(oldPublicId)
    
    if(!deletion || deletion.result !== "ok"){
         console.error("Failed to delete old coverImage:", oldPublicId);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover Image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{

 
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

  

    const channel= await User.aggregate([
        {
        $match : {
            username:username?.toLowerCase()  
           
        }
       }, 
       {
        $lookup:{
            from: "subscriptions",  
            localField:"_id", 
            foreignField:"channel",
            as:"subscribers"  

        }
       },
      

        { 
             $lookup:{
            from: "subscriptions",  
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"

        }

        },
        {
        $addFields:{ 
            subscribersCount:{
                $size:"$subscribers" 
            },
            channelsSubscribedToCount:{
                $size:"$subscribedTo" 
            },
            isSubscribed:{ 
                $cond : {
                    if:{
                        $in:[req.user?._id,"$subscribers.subscriber"] 
                    },
                    then: true,
                    else: false

                }
            },
           }
         },
         { 
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1

            }
         }
    ])
    

    if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )

})



const getWatchHistory = asyncHandler(async(req,res)=>{

    const user=await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id) 
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
           
                 pipeline:[

                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]

                        },
                    },
                    {
                        $addFields:{ 
                            owner:{ 
                                $first:"$owner"
                            }
                        }
                    }
                 ]

            },


        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(
            200,user[0].watchHistory,"watch history fetched successfully "
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUSer,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}