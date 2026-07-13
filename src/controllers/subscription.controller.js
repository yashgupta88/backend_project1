

import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Video } from "../models/video.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2.js";
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params  

    if(! mongoose.Types.ObjectId.isValid(channelId)){
            throw new ApiError(400,"Invalid channel Id")
    }
    
    const channel = await User.exists({_id:channelId})
    
    
    if(!channel){
        throw new ApiError(404,"channel Not Found")
    }

    let isSubscribed;
    const exist=await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    })

    if(! exist){
        await Subscription.create({
            subscriber:req.user._id,
            channel:channelId
        })
        isSubscribed=true
    }
    else{
        await Subscription.findByIdAndDelete(exist._id)
        isSubscribed=false
    }

    return res.status(200).json(new ApiResponse(200,{isSubscribed},"toggled Successfully"))
})
const getAllSubscribers = asyncHandler(async(req,res)=>{
    const userId=req.user._id;

    const aggregate = Subscription.aggregate([
       {
         $match:{
            channel:userId
        }
       },{
        $lookup:{
            from : "users",
            localField:"subscriber",
            foreignField:"_id",
            pipeline:[
                {
                    $project:{
                        _id:1,
                        avatar:1,
                        username:1,
                    }
                }
            ],
            as:"subscriber"
        }
       },{
        $addFields:{
            subscriber:{
                $first:"$subscriber"
            }
        }
       },{
        $project:{
            subscriber:1,
            createdAt:1
        }
       }
    ])
  const {page=1,limit=10}=req.query
    const options={
            page:Number(page) ,
            limit:Number(limit) 
        }
    const subscribers= await Subscription.aggregatePaginate(aggregate,options);

    return res.status(200).json(new ApiResponse(200,subscribers,"Fetched Successfully"))


})
const subscribedChannels = asyncHandler(async(req,res)=>{
    const userId=req.user._id;

    const aggregate = Subscription.aggregate([
       {
         $match:{
            subscriber:userId
        }
       },{
        $lookup:{
            from : "users",
            localField:"channel",
            foreignField:"_id",
            pipeline:[
                {
                    $project:{
                        _id:1,
                        avatar:1,
                        username:1,
                    }
                }
            ],
            as:"channel"
        }
       },{
        $addFields:{
            channel:{
                $first:"$channel"
            }
        }
       },{
        $project:{
            channel:1,
            createdAt:1
        }
       }
    ])
  const {page=1,limit=10}=req.query
    const options={
            page:Number(page) ,
            limit:Number(limit) 
        }
    const channels= await Subscription.aggregatePaginate(aggregate,options);

    return res.status(200).json(new ApiResponse(200,channels,"Fetched Successfully"))


})

export{
    toggleSubscription,
    getAllSubscribers,
    subscribedChannels
}