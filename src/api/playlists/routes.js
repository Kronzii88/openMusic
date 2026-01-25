import express from "express";

const routes = (handler) => {
  const router = express.Router();

  // --- Playlist Utama ---

  // POST /playlists -> Tambah Playlist
  router.post("/", handler.postPlaylistHandler);

  // GET /playlists -> Lihat daftar Playlist (Milik sendiri + Kolaborasi)
  router.get("/", handler.getPlaylistsHandler);

  // DELETE /playlists/{id} -> Hapus Playlist
  router.delete("/:id", handler.deletePlaylistByIdHandler);

  // --- Lagu di dalam Playlist ---

  // POST /playlists/{id}/songs -> Tambah lagu ke playlist
  router.post("/:id/songs", handler.postSongToPlaylistHandler);

  // GET /playlists/{id}/songs -> Lihat daftar lagu di playlist
  router.get("/:id/songs", handler.getSongsFromPlaylistHandler);

  // DELETE /playlists/{id}/songs -> Hapus lagu dari playlist
  router.delete("/:id/songs", handler.deleteSongFromPlaylistHandler);

  // --- Aktivitas Playlist ---

  // GET /playlists/{id}/activities -> Lihat riwayat aktivitas
  router.get("/:id/activities", handler.getPlaylistActivitiesHandler);

  return router;
};

export default routes;
