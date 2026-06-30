// agar humne method bana liya hai lekin method run kab ho , jab koi url hit ho tab run ho 
// toh us url ke liye hum routes likhte hai 
// now we make routes and export 

import { Router } from "express";
import { loginUser, logoutUSer, registerUser ,refreshAccessToken , changeCurrentPassword,getCurrentUser,
    updateAccountDetails,updateUserAvatar
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
) // is route me "registerUser" method chalega 
// router.route("/login").post(login)// for eg , here login method runs 

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post( // is route ko hum get me bhi handle kar sakte hai 
    verifyJWT,
    logoutUSer)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-current-password").post(
    verifyJWT ,
    changeCurrentPassword
)

router.route("/get-user").post(
    verifyJWT ,
    getCurrentUser
)

router.route("/update-Account-details").post(
    verifyJWT ,
    updateAccountDetails
)

router.route("/update-Avatar").post(

    verifyJWT ,
    upload.single(
        {
            name:"avatar",
            maxCount : 1
        }
    ) ,
    updateUserAvatar
)

/*
Now , we are going to use Postman or Thunder Client to test APIs , because these helps to test API 
without needing a frontend (website or mobile app )

paste that "http link" there and select the type of requets like which type , get , post , patch or anything and click on send and then you will get all thing 

and you will get the reponse you want and also with all information like status code , message etc 

Industry me sabse jyada use hota hai POSTMAN 
and thunder client bhi same hi hota hai , infact thunderclient toh vs code me hi pkugin hota hai 
and postman bhi vs code me extension me ho jata hai 

hum log mostly Postman use karenge 

this tool has many information like error type , time taken by the server and many more , we study later
 */





export default router 