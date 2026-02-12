import express from "express";

const routes = (handler) => {
  const router = express.Router();

  // URL Akhir: POST /export/playlists/{playlistId}
  router.post("/playlists/:id", handler.postExportPlaylistsHandler);

  return router;
};

export default routes;
