import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { deleteVideo, getAllVideos, getVideoById, getVideosOfUser, incrementViews, togglePublishStatus, updateVideo, uploadVideo } from "../controllers/video.controller";
import { upload } from "../middlewares/multer.middleware";
const router=Router()

router.route("/upload-video").post(
    verifyJWT,
    upload.fields([
        {name:"videoFile"},{name:"thumbnail"}
    ]),
    uploadVideo
)
router.route("/getVideoById/:videoId").get( // taking videoId as a parameter 
    verifyJWT,
    getVideoById
)
router.route("/getAllVideos").get( 
    getAllVideos
)
router.route("/getVideosOfUser").get(
    verifyJWT,
    getVideosOfUser
)
router.route("/updateVideo/:videoId").patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
)
router.route("/deleteVideo/:videoId").delete(
    verifyJWT,
    deleteVideo
)
router.route("/togglePublishStatus/:videoId").delete(
    verifyJWT,
    togglePublishStatus
)
router.route("/incrementViews/:videoId").delete(
    incrementViews
)