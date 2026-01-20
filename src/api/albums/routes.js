import express from "express";
import AlbumsHandler from "./handler.js";
import AlbumsService from "../../services/postgres/AlbumsService.js";
import AlbumsValidator from "../../validator/albums/index.js";

const router = express.Router();

// Dependency Injection manual
const albumsService = new AlbumsService();
const albumsHandler = new AlbumsHandler(albumsService, AlbumsValidator);

router.post("/", albumsHandler.postAlbumHandler);
router.get("/:id", albumsHandler.getAlbumByIdHandler);
router.put("/:id", albumsHandler.putAlbumByIdHandler);
router.delete("/:id", albumsHandler.deleteAlbumByIdHandler);

export default router;
