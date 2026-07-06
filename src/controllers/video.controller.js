// video upload from channel
// upfate details like thumbnail,title,description etc
// delete video 

/**
 * uploadVideo
getAllVideos (with pagination, search, and sorting)
getVideoById
updateVideo
updateVideoThumbnail
deleteVideo
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { deleteImageFromCloudinary } from "../utils/cloudinary.js";


const uploadVideo = asyncHandler (async (req , res)=>{


    const {title , description , isPublished} = req.body

    if([title , description ] . some((field)=> !field || field.trim()==="")){
        throw new ApiError(400 , "All fields required")
    }

    const videoFilePath=req.files?.videoFile?.[0]?.path

    if(! videoFilePath){
        throw new ApiError(400 , "video file is required")
    }
    const thumbnailFilePath=req.files?.thumbnail?.[0]?.path

    if(! thumbnailFilePath){
        throw new ApiError(400 , "thumbnail file is required")
    }

    const videoFile =await  uploadOnCloudinary(videoFilePath)
    const thumbnail =await uploadOnCloudinary(thumbnailFilePath)

    if(!videoFile){
        throw new ApiError(500,"Internal error while uploading videoFile")
    }

    if(!thumbnail){
        throw new ApiError(500,"Internal error while uploading thumbnail")
    }

    const video =await Video.create({
        title,
        description,
        isPublished,
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail:{
            url:thumbnail.url,
            public_id:thumbnail.public_id
        } ,
        duration: videoFile.duration,
        owner:req.user._id,
        views:0


    })

    if(! video ){
        throw new ApiError(500, "Something went wrong while uploading video");
    }

    return res.status(201).json(
        new ApiResponse(200,video,"video uploaded successfully ")
    )

})

const getVideoById = asyncHandler(async(req,res)=>{
    // video id is coming from url 
    const {videoId}=req.params

    const video=await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId)
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
                        username:1,
                        _id:1,
                        fullName:1,
                        avatar:1
                       }
                    }
                ],
                as:"videoUploader"
            },
            
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"owner",
                foreignField:"channel",
                as:"subscribers"
            }
        },
       
        {
            $addFields:{
                owner:{
                    $first:"$videoUploader"
                },
                subscriberCount:{
                    $size:"$subscribers"
                },
                isSubscribed:{
                $cond:{
                    if:{
                        $in:[req.user._id,"$subscribers.subscriber"]
                    },
                    then:true,
                    else:false
                }
                }
            }
        },
        {
            $project:{
                videoFile:1,
                thumbnail:1,
                owner:1,
                title:1,
                description:1,
                duration:1,
                views:1,
                isPublished:1,
                subscriberCount:1,
                isSubscribed:1


            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,video[0],"video fetched Successfully")
    )
})

const getAllVideos = asyncHandler(async(req,res)=>{  // all videos , not a specific channel videos 

    const aggregate = Video.aggregate([ // remove await because , aggreagte paginate needs aggregate object 
        // not array of docs , it needs before processing , then it process and paginate alongwith 
        {
            $match:{
                isPublished: true
            }
        },
        {
            $sort:{
                createdAt:-1
                // Note "sort" sort docs in ascending order , when we give 1 and in descending order , when -1
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

    const options={
        page:Number(req.query.page) || 1,
        limit:Number(req.query.limit) || 10
    }

    const video= await Video.aggregatePaginate(aggregate,options);

    // video contains docs in which all docs of 10 videos are there and further the information of pages , like 
    // limit ,nextpage etc .. 
    

    return res.status(200).json(
        new ApiResponse(200,video,"Page fetched successfully")
    )


})

// taking user Id by frontend to take all of its videos 
const getVideosOfUser = asyncHandler(async(req,res)=>{
    const {userId} = req.params

    if(! mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400 , "Invalid User Id")
    }

    const video= await Video.find({
        owner:userId,
        isPublished:true
    }).sort({createdAt:-1})

    return res.status(200).json(
        new ApiResponse(200,video,"videos fetched SuccessFully")
    )

})

// update video details like thumbnail ,  title , description

const updateVideo = asyncHandler(async(req,res)=>{

     const {videoId} = req.params

     if( ! mongoose.Types.ObjectId.isValid(videoId)){
          throw new ApiError(400,"Invalid Video Id")
     }

    const video= await Video.findById(videoId)

    if(! video){
         throw new ApiError(404,"Video Does Not Exist")
    }
   

    if(req.user._id.toString() !== video.owner.toString()){  // ownership check is required 
        throw new ApiError(403,"Unauthorized access")
    }
    

    const thumbnailLocalPath = req.file?.path
    const oldPublicId=video.thumbnail.public_id;

    const {title,description} = req.body

    const update = new Object();

    if(thumbnailLocalPath) {
         const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
         const deletion = await deleteImageFromCloudinary (oldPublicId);
         if(! deletion || deletion.result !== "ok"){
            console.log("deletion on cloudinary failed")
         }
         update.thumbnail={
            url:thumbnail.url,
            public_id:thumbnail.public_id
         }
    }
    if(description) update.description=description
    if(title) update.title=title

    if(Object.keys(update).length === 0){
        throw new ApiError(400 , "No fields provided to update ")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
            videoId
            ,
            {
                $set: update
            }
           ,
            {
                new:true
            }
        )
    

    // findbyIdandupdate , only finds by id and update and also can return new updated document
    // updateone , updates the first document matching with given condition and return only updated information


    return res.status(200).json(new ApiResponse(200,updatedVideo,"Updated Successfully"))

})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(! videoId) {
        throw new ApiError(400 , "Invalid video Id")
    }

    if(! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const video=await Video.findById(videoId)

    if(! video){
        throw new ApiError(404 ," Video does not exist")
    }

    if(video.owner.toString() !== req.user._id.toString()){
          throw new ApiError(403,"Unauthorized access")
    }

    // note --> when we use findByIdAndDelete() , then Mongoose first finds the document , keeps a copy in 
    // memory , then deletes it from the database and finally returns the copy 
    // and that copied document helps to further delete the files from cloudinary or else 

    // deleteOne deletes the first document matching the filter and returns only the deleted information

   const deletedVideoDoc= await Video.findByIdAndDelete(
        videoId
    )

    if(! deletedVideoDoc){
        throw new ApiError(400,"Failed to delete video")
    }



    try{
         await deleteImageFromCloudinary(deletedVideoDoc.videoFile?.public_id)
    }
    catch(err){
         console.log(err)
    }

    try{
        await deleteImageFromCloudinary(deletedVideoDoc.thumbnail?.public_id)
    }
    catch(err){
        console.log(err)
    }

    
        
    

    return res.status(200).json(new ApiResponse(200,{},"Deletion of Video Successful"))
})

const togglePublishStatus = asyncHandler(async(req,res)=>{

    const {videoId} = req.params

    if( ! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }

    const video =await Video.findById(videoId)

    if(! video){
        throw new ApiError(404 , "Video Does Not Exist")
    }

    const userId = req.user?._id

    if(userId.toString() !== video.owner.toString()){
        throw new ApiError(403, "Unauthorized Access");
    }

    video.isPublished = !video.isPublished
   await  video.save({validateBeforeSave:false})

   return res.status(200).json(new ApiResponse(200,{isPublished:video.isPublished},"Publish Status Changed successfully"))


})

const incrementViews = asyncHandler(async(req,res)=>{

    const {videoId} = req.params

    if(! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

   const video = await Video.findByIdAndUpdate(
    videoId,
    {
        $inc:{
            views:1
        }
    },
    {
        new:true
    }
   )

   if(! video){
    throw new ApiError(404 , "Video Not Found")
   }

    return res.status(200).json(new ApiResponse(200,{views:video.views},"views incremented SuccessFully"))
})



export {uploadVideo ,
    getVideoById,
    getAllVideos,
    getVideosOfUser,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViews
}