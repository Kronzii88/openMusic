import autoBind from "auto-bind";
class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(req, res, next) {
    try {
      this._validator.validateAlbumPayload(req.body);
      const { name, year } = req.body;
      const albumId = await this._service.addAlbum({ name, year });

      res.status(201).json({
        status: "success",
        message: "Album berhasil ditambahkan",
        data: { albumId },
      });
    } catch (error) {
      next(error); // Lempar ke middleware error handling di server.js
    }
  }

  async getAlbumByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const album = await this._service.getAlbumById(id);
      res.json({
        status: "success",
        data: { album },
      });
    } catch (error) {
      next(error);
    }
  }

  async putAlbumByIdHandler(req, res, next) {
    try {
      this._validator.validateAlbumPayload(req.body);
      const { id } = req.params;
      await this._service.editAlbumById(id, req.body);

      res.json({
        status: "success",
        message: "Album berhasil diperbarui",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAlbumByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteAlbumById(id);

      res.json({
        status: "success",
        message: "Album berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AlbumsHandler;
