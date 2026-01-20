class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(req, res, next) {
    try {
      this._validator.validateSongPayload(req.body);
      const songId = await this._service.addSong(req.body);

      res.status(201).json({
        status: "success",
        message: "Lagu berhasil ditambahkan",
        data: { songId },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSongsHandler(req, res, next) {
    try {
      const { title, performer } = req.query;
      const songs = await this._service.getSongs(title, performer);
      res.json({
        status: "success",
        data: { songs },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSongByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const song = await this._service.getSongById(id);
      res.json({
        status: "success",
        data: { song },
      });
    } catch (error) {
      next(error);
    }
  }

  async putSongByIdHandler(req, res, next) {
    try {
      this._validator.validateSongPayload(req.body);
      const { id } = req.params;
      await this._service.editSongById(id, req.body);

      res.json({
        status: "success",
        message: "Lagu berhasil diperbarui",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSongByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteSongById(id);

      res.json({
        status: "success",
        message: "Lagu berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SongsHandler;
