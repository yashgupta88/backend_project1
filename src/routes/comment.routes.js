import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createComment, deleteComment, fetchAllComments, updateComment } from "../controllers/comment.controller";



const router=Router();


router.route("/create-comment/:videoId").post(
    verifyJWT,
    createComment
)
router.route("/update-comment/:commentId").patch(
    verifyJWT,
   updateComment
)
router.route("/delete-comment/:commentId").post(
    verifyJWT,
    deleteComment
)
router.route("/fetch-All-Comments/:videoId").post(
    
    fetchAllComments
)