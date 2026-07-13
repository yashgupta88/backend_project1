
import { Router } from "express";
import { loginUser,
    logoutUSer,
    registerUser ,
    refreshAccessToken ,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount : 1
        },
        {
            name:"coverImage",
            maxCount : 1
        }
    ])    // fields() ,return middleware that processes multiple files associated with the give form fields , many other options like single and array 
    // single , ek hi file lene ke liye hai 
    // array , ek hi field me multiple files  lene ke liye hai 
    // fields , multiple files from different fields

    // in this way we had injected an middleware of multer before going to "registerUser" 
    ,
    registerUser
) 

router.route("/login").post(loginUser)


router.route("/logout").post( 
    verifyJWT,
    logoutUSer)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(
    verifyJWT ,
    changeCurrentPassword
)

router.route("/current-user").get(
    verifyJWT ,
    getCurrentUser
)

router.route("/update-account").patch(  
    verifyJWT ,
    updateAccountDetails
)

router.route("/avatar").patch(

    verifyJWT ,
    upload.single("avatar"),
    updateUserAvatar
)

router.route("/cover-image").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
)

router.route("/channel-profile/:username")  
.get(verifyJWT,
   getUserChannelProfile 
)

router.route("/history").get(verifyJWT,getWatchHistory)


export default router 