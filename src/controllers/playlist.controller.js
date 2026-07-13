import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Video } from "../models/video.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2.js";
import { User } from "../models/user.model.js";



const createPlaylist = asyncHandler(async(req , res)=>{

    const {name,description} = req.body

    if( ! name?.trim() || ! description?.trim()){
        throw new ApiError(400,"All Fields Are Required")
    }

    const playlist= await Playlist.create({
        name:name,
        description:description,
        owner:req.user._id
    })

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Created SuccessFully"))
})
const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    
    const {playlistId , videoId} = req.params

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }
    if(! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    if(!playlist){
        throw new ApiError(400,"Playlist Not Found")
    }
    if(!video){
        throw new ApiError(400,"Video Not Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized Access")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{ 
                videos:videoId
            }
        },{
            new:true
        }
    )
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Video Added Successfully"))


})
const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId } = req.params

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

   

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as :"videos",
                pipeline:[
                    {
                        $lookup:{
                             from:"users",
                             localField:"owner",
                             foreignField:"_id",
                             as:"owner",
                             pipeline:[{
                                $project:{
                                    username:1,
                                    _id:1,
                                    avatar:1
                                }
                            }
                             ],
                             
                        }
                       
                    },
                    {
                            $addFields:{
                                owner:{
                                $first:"$owner"
                                }
                            }
                    },
                    {
                        $sort:{
                            createdAt:-1
                        }
                    } ,
                    {
                        $project:{
                            title:1,
                            videoFile:1,
                            thumbnail:1,
                            description:1,
                            owner:1,
                            duration:1,
                            views:1,
                            isPublished:1

                        }
                    }
                     
                ]
            }
        },
        {
            $lookup:{
                from:"users", 
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        _id:1,
                        username:1,
                        avatar:1
                    }
                }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $project:{
                name:1,
                description:1,
                videos:1,
                owner:1,
                createdAt:1
            }
        }
    ])

    if(playlist.length === 0 ){
        throw new ApiError(404,"Playlist Not Found")
    }

    return res.status(200).json(new ApiResponse(200,playlist[0],"Playlist fetched Successfully"))
})
const getUserAllPlaylists = asyncHandler(async(req,res)=>{
    const {userId} =req.params

    if(! mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid User Id")
    }

    const user=await User.findById(userId)

    if(! user ){
         throw new ApiError(400,"User Not Found")
    }

    const playlists =await Playlist.find(
                          {owner:userId}
                    ).sort({createdAt:-1})
    

    return res.status(200).json(new ApiResponse(200,playlists,"Playlists fetched successfully"))

})
const updatePlaylist = asyncHandler(async(req,res)=>{
  

    
    const {name,description} = req.body

    const {playlistId} = req.params

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist Not Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized Access")
    }

    if( ! name?.trim() && ! description?.trim()){
        throw new ApiError(400,"Both should not be empty")
    }
    
    if(name?.trim()){
        playlist.name = name
    }
    if(description?.trim()){
        playlist.description = description
    }

     

    await playlist.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,playlist,"Updated Successfully"))

    
})
const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }
    if(! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }

    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    

    if(!playlist){
        throw new ApiError(404,"Playlist Not Found")
    }
    if(! video){
        throw new ApiError(404,"Video Not Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized Access")
    }

    const exist = playlist.videos.some((id)=> id.toString() === videoId)

    if(! exist){
        throw new ApiError(404,"Video Not Found Inside Playlist")
    }

    const newPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{ 
                videos:videoId
            }
        },
        {
            new:true
        }
    )

    return res.status(200).json(new ApiResponse(200,newPlaylist,"Video Removed Successfully"))


})
const deletePlaylist = asyncHandler(async(req,res)=>{

     const {playlistId} = req.params

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    const playlist = await Playlist.findById(playlistId)

     if(!playlist){
        throw new ApiError(404,"Playlist Not Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized Access")
    }

    const deletedPlaylist =await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(new ApiResponse(200,deletedPlaylist,"Playlist Deleted Successfully"))


})

export {
    createPlaylist,
    addVideoToPlaylist,
    getPlaylistById,
    getUserAllPlaylists,
    updatePlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
}

