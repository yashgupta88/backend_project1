

import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { Video } from "../models/video.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(! mongoose.Types.ObjectId.isValid(videoId)){
            throw new ApiError(400,"Invalid Video Id")
    }
    
    const video = await Video.exists({_id:videoId})
    
    
    if(!video){
        throw new ApiError(404,"video Not Found")
    }

    let isLiked;
    const exist=await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })

    if(! exist){
        await Like.create({
            video:videoId,
            likedBy:req.user._id
        })
        isLiked=true
    }
    else{
        await Like.findByIdAndDelete(exist._id)
        isLiked=false
    }

    return res.status(200).json(new ApiResponse(200,{isLiked},"toggled Successfully"))
})
const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params

    if(! mongoose.Types.ObjectId.isValid(commentId)){
            throw new ApiError(400,"Invalid Comment Id")
    }
    
    const comment = await Comment.exists({_id:commentId})
    
    
    if(!comment){
        throw new ApiError(404,"Comment Not Found")
    }

    let isLiked;
    const exist=await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })

    if(! exist){
        await Like.create({
            comment:commentId,
            likedBy:req.user._id
        })
        isLiked=true
    }
    else{
        await Like.findByIdAndDelete(exist._id)
        isLiked=false
    }

    return res.status(200).json(new ApiResponse(200,{isLiked},"toggled Successfully"))
})
const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params

    if(! mongoose.Types.ObjectId.isValid(tweetId)){
            throw new ApiError(400,"Invalid Tweet Id")
    }
    
    const tweet = await Tweet.exists({_id:tweetId})
    
    
    if(!tweet){
        throw new ApiError(404,"tweet Not Found")
    }

    let isLiked;
    const exist=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })

    if(! exist){
        await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        })
        isLiked=true
    }
    else{
        await Like.findByIdAndDelete(exist._id)
        isLiked=false
    }

    return res.status(200).json(new ApiResponse(200,{isLiked},"toggled Successfully"))
})
const getLikedVideos= asyncHandler(async(req,res)=>{

    const userId=req.user._id

    const {page=1,limit=10}=req.query  

    const aggregate= Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(userId)
            }
        },
        
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                        $lookup:{
                             from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            pipeline:[
                                {
                                    $project:{   
                                        avatar:1,
                                        username:1
                                    }
                                }
                            ],
                            as:"owner"
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    },{
                        $project:{
                            thumbnail:1,
                            videoFile:1,
                            owner:1,
                            duration:1,
                            views:1,
                            title:1,
                            description:1,
                            isPublished:1
                        }
                    }

                ]

            }
        },{
            $addFields:{
                video:{
                    $first:"$video"
                }
                
            }
        }
        ,{
            $project:{
                video:1,
                createdAt:1
                
            }
        }
    ])

    const options={
        page:Number(page) ,
        limit:Number(limit) 
    }
    const Likedvideos= await Like.aggregatePaginate(aggregate,options);

  

    return res.status(200).json(new ApiResponse(200,Likedvideos,"All liked videos Fetched Successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}