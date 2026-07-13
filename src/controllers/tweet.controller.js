

import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Video } from "../models/video.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const createTweet = asyncHandler(async (req,res)=>{
  

    const {content} = req.body

    if(! content?.trim()){
        throw new ApiError(400, "Tweet cannot be empty")
    }

    const userId = req.user._id
    const tweet =await Tweet.create(
        {
            content,
            owner:userId
        }
    )

    return res.status(201).json(new ApiResponse(201,tweet,"Tweet Saved Successfully"))
})

const updateTweet = asyncHandler (async (req,res)=>{

    const {tweetId}=req.params

    if( ! mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid Tweet Id");
    }

    const tweet=await Tweet.findById(tweetId)

    if(! tweet){
         throw new ApiError(400, "Tweet Does Not Exist");
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
         throw new ApiError(403, "Unauthorized Access");
    }

    const {content} = req.body

    if(! content?.trim()){
        throw new ApiError(400, "tweet cannot be empty")
    }

    tweet.content = content

    await tweet.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,tweet,"tweet updated SuccessFully"))
})

const deleteTweet = asyncHandler (async(req,res)=>{
    const {tweetId}=req.params

    if( ! mongoose.Types.ObjectId.isValid(tweettId)){
        throw new ApiError(400, "Invalid tweet Id");
    }

    const tweet=await Tweet.findById(tweetId)

    if(! tweet){
         throw new ApiError(404, "Tweet Does Not Exist");
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
         throw new ApiError(403, "Unauthorized Access");
    }

    const deleted = await Comment.findByIdAndDelete(tweetId);

    if(! deleted){
        throw new ApiError(400, "Deletion Failed");
    }
    return res.status(200).json(new ApiResponse(200,{},"Tweet Deleted "))
})

const fetchUserAllTweet = asyncHandler (async(req,res)=>{
    

    const aggregate = Tweet.aggregate([
        {
           $match:{
            owner:req.user._id
           }
        },
        {
             $sort:{
                createdAt:-1
            }
            
        },{
            $project:{
                content:1,
                createdAt:1,
                updatedAt:1
            }
        }

    ])

    const {page,limit} = req.query

    const options = {
        page:Number(page) || 1,
        limit:Number(limit) || 20
    }

    const tweets = await Tweet.aggregatePaginate(aggregate,options);

    return res.status(200).json(new ApiResponse(200,tweets,"Tweets Fetched Successfully"))

})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    fetchUserAllTweet
}
