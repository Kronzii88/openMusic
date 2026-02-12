import autoBind from "auto-bind";

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    autoBind(this);
  }

  async postExportPlaylistsHandler(req, res, next) {
    try {
      this._validator.validateExportPlaylistsPayload(req.body);

      const { id: playlistId } = req.params;
      const { id: credentialId } = req.user;
      const { targetEmail } = req.body;

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      const message = { playlistId, targetEmail };
      await this._producerService.sendMessage(
        "export:playlists",
        JSON.stringify(message)
      );

      res.status(201).json({
        status: "success",
        message: "Permintaan Anda sedang kami proses",
      });
    } catch (error) {
      next(error);
    }
  }
}
export default ExportsHandler;
