import express from "express";
import SongsHandler from "./handler.js";
import SongsService from "../../services/postgres/SongsService.js";
import SongsValidator from "../../validator/songs/index.js";

const router = express.Router();

const songsService = new SongsService();
const songsHandler = new SongsHandler(songsService, SongsValidator);

router.post("/", songsHandler.postSongHandler);
router.get("/", songsHandler.getSongsHandler);
router.get("/:id", songsHandler.getSongByIdHandler);
router.put("/:id", songsHandler.putSongByIdHandler);
router.delete("/:id", songsHandler.deleteSongByIdHandler);

export default router;
