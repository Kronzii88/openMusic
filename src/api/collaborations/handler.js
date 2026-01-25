class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler =
      this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(req, res, next) {
    try {
      this._validator.validateCollaborationPayload(req.body);

      const { id: credentialId } = req.user; // ID user yang login
      const { playlistId, userId } = req.body; // userId disini adalah calon kolaborator

      // 1. Pastikan Playlist ada dan Requester adalah Owner
      // Hanya Owner yang boleh menambahkan kolaborator
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      // 2. Tambahkan kolaborasi (Optional: verifikasi user yang ditambahkan ada di db user)
      const collaborationId =
        await this._collaborationsService.addCollaboration(playlistId, userId);

      res.status(201).json({
        status: "success",
        message: "Kolaborasi berhasil ditambahkan",
        data: {
          collaborationId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCollaborationHandler(req, res, next) {
    try {
      this._validator.validateCollaborationPayload(req.body);

      const { id: credentialId } = req.user;
      const { playlistId, userId } = req.body;

      // 1. Pastikan Requester adalah Owner
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      // 2. Hapus kolaborasi
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      res.json({
        status: "success",
        message: "Kolaborasi berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CollaborationsHandler;
