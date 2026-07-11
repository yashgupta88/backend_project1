import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, fetchUserAllTweet, updateTweet } from "../controllers/tweet.controller.js";



const router=Router();


router.route("/create-Tweet").post(
    verifyJWT,
    createTweet
)
router.route("/update-Tweet/:tweetId").patch(
    verifyJWT,
   updateTweet
)
router.route("/delete-Tweet/:tweetId").delete(
    verifyJWT,
    deleteTweet
)
router.route("/fetch-Users-ALL-Tweet").get(
    
    verifyJWT,
    fetchUserAllTweet
)


export default router