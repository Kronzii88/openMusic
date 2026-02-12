import autoBind from "auto-bind";

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(req, res, next) {
    try {
      // 1. Cek apakah file ada (Multer sudah bekerja sebelum ini)
      if (!req.file) {
        throw new InvariantError("Mohon upload file cover");
      }

      const { file } = req;

      // 2. Validasi Content-Type menggunakan Validator yang baru dibuat
      // Kita memalsukan objek headers agar sesuai schema Joi
      this._validator.validateImageHeaders({
        "content-type": file.mimetype,
      });

      // 3. Simpan file
      const filename = await this._service.writeFile(file, file.originalname);
      const { id } = req.params;

      // 4. Update database
      await this._albumsService.editAlbumCoverById(id, filename);

      res.status(201).json({
        status: "success",
        message: "Sampul berhasil diunggah",
      });
    } catch (error) {
      next(error);
    }
  }
}
export default UploadsHandler;
