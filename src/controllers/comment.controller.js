
import { Comment } from "../models/comment.model";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { verifyJWT } from "../middlewares/auth.middleware";
import { Video } from "../models/video.model";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const createComment = asyncHandler(async (req,res)=>{
    const {videoId} = req.params

    if( ! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400 , "Invalid Video Id")
    }


    const userId = req.user?._id 
    if(! userId){
        throw new ApiError(403 , "Login Required for Commenting ")
    }

    const {content} = req.body

    if(! content?.trim()){
        throw new ApiError(400, "Comment cannot be empty")
    }

    const comment =await Comment.create(
        {
            content,
            video:videoId,
            owner:userId
        }
    )

    return res.status(201).json(new ApiResponse(201,comment,"Comment Saved Successfully"))
})

const updateComment = asyncHandler (async (req,res)=>{

    const {commentId}=req.params

    if( ! mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid Comment Id");
    }

    const comment=await Comment.findById(commentId)

    if(! comment){
         throw new ApiError(400, "Comment Does Not Exist");
    }

    if(comment.owner.toString() !== req.user._id.toString()){
         throw new ApiError(403, "Unauthorized Access");
    }

    const {content} = req.body

    if(! content?.trim()){
        throw new ApiError(400, "Comment cannot be empty")
    }

    comment.content = content

    await comment.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,comment,"Comment updated SuccessFully"))
})

const deleteComment = asyncHandler (async(req,res)=>{
    const {commentId}=req.params

    if( ! mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid Comment Id");
    }

    const comment=await Comment.findById(commentId)

    if(! comment){
         throw new ApiError(404, "Comment Does Not Exist");
    }

    if(comment.owner.toString() !== req.user._id.toString()){
         throw new ApiError(403, "Unauthorized Access");
    }

    const deleted = await Comment.findByIdAndDelete(commentId);

    if(! deleted){
        throw new ApiError(400, "Deletion Failed");
    }
    return res.status(200).json(new ApiResponse(200,{},"Comment Deleted "))
})

const fetchAllComments = asyncHandler (async(req,res)=>{
    const {videoId}=req.params

      if( ! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video Id");
    }

    const video=await Video.findById(videoId)

    if(! video){
        throw new ApiError(404 , "Video Not Found")
    }

    const aggregate = Comment.aggregate([
        {
           $match:{
            video:new mongoose.Types.ObjectId(videoId)
           }
        },
        {
             $sort:{
                createdAt:-1
            }
            
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            avatar:1
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
        }
        

    ])

    const {page,limit} = req.query

    const options = {
        page:Number(page) || 1,
        limit:Number(limit) || 20
    }

    const comments = await Comment.aggregatePaginate(aggregate,options);

    return res.status(200).json(new ApiResponse(200,comments,"Comments Fetched Successfully"))

})

export {
    createComment,
    updateComment,
    deleteComment,
    fetchAllComments
}