import autoBind from "auto-bind";

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(req, res, next) {
    try {
      this._validator.validatePlaylistPayload(req.body);
      const { name } = req.body;
      const { id: credentialId } = req.user; // Diambil dari JWT
      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialId,
      });
      res.status(201).json({ status: "success", data: { playlistId } });
    } catch (error) {
      next(error);
    }
  }

  async getPlaylistsHandler(req, res, next) {
    try {
      const { id: credentialId } = req.user;
      const playlists = await this._service.getPlaylists(credentialId);
      res.json({ status: "success", data: { playlists } });
    } catch (error) {
      next(error);
    }
  }

  async deletePlaylistByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const { id: credentialId } = req.user;
      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);
      res.json({ status: "success", message: "Playlist berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }

  async postSongToPlaylistHandler(req, res, next) {
    try {
      this._validator.validatePlaylistSongPayload(req.body);
      const { id: playlistId } = req.params;
      const { songId } = req.body;
      const { id: credentialId } = req.user;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      await this._service.verifySongExists(songId);

      await this._service.addSongToPlaylist(playlistId, songId);

      await this._service.addActivity(playlistId, songId, credentialId, "add");

      res.status(201).json({
        status: "success",
        message: "Lagu berhasil ditambahkan ke playlist",
      });
    } catch (error) {
      next(error);
    }
  }

  async getSongsFromPlaylistHandler(req, res, next) {
    try {
      const { id: playlistId } = req.params;
      const { id: credentialId } = req.user;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const playlist = await this._service.getSongsFromPlaylist(playlistId);
      res.json({ status: "success", data: { playlist } });
    } catch (error) {
      next(error);
    }
  }

  async deleteSongFromPlaylistHandler(req, res, next) {
    try {
      this._validator.validatePlaylistSongPayload(req.body);
      const { id: playlistId } = req.params;
      const { songId } = req.body;
      const { id: credentialId } = req.user;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongFromPlaylist(playlistId, songId);

      // Log Activity
      await this._service.addActivity(
        playlistId,
        songId,
        credentialId,
        "delete"
      );

      res.json({
        status: "success",
        message: "Lagu berhasil dihapus dari playlist",
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlaylistActivitiesHandler(req, res, next) {
    try {
      const { id: playlistId } = req.params;
      const { id: credentialId } = req.user;
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const activities = await this._service.getPlaylistActivities(playlistId);
      res.json({
        status: "success",
        data: { playlistId, activities },
      });
    } catch (error) {
      next(error);
    }
  }
}
export default PlaylistsHandler;
