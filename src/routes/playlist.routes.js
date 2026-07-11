import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserAllPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller";
import { verify } from "jsonwebtoken";

const router=Router()

router.route("/create-Playlist").post(
    verifyJWT,
    createPlaylist
)
router.route("/add-Video-To-Playlist/:playlistId/:videoId").patch(
    verifyJWT,
    addVideoToPlaylist
)
router.route("/get-Playlist-By-id/:playlisytId").get(
    getPlaylistById
)
router.route("/get-User-All-Playlist/:userId").get(
    getUserAllPlaylists
)
router.route("/update-Playlist/:playlistId").patch(
    verifyJWT,
    updatePlaylist
)
router.route("/remove-Video-From-Playlist/:playlistId/:videoId").patch(
    verifyJWT,
    removeVideoFromPlaylist
)
router.route("/delete-Playlist/:playlistId").delete(
    verifyJWT,
    deletePlaylist
)

export default router