import autoBind from "auto-bind";

class LikesHandler {
  constructor(service) {
    this._service = service;
    autoBind(this);
  }

  async postLikeHandler(req, res, next) {
    try {
      const { id: albumId } = req.params;
      const { id: credentialId } = req.user;

      await this._service.addLike(credentialId, albumId);

      res.status(201).json({
        status: "success",
        message: "Berhasil menyukai album",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLikeHandler(req, res, next) {
    try {
      const { id: albumId } = req.params;
      const { id: credentialId } = req.user;

      await this._service.deleteLike(credentialId, albumId);

      res.json({
        status: "success",
        message: "Batal menyukai album",
      });
    } catch (error) {
      next(error);
    }
  }

  async getLikesHandler(req, res, next) {
    try {
      const { id: albumId } = req.params;
      const { likes, isCache } = await this._service.getLikes(albumId);

      if (isCache) {
        res.header("X-Data-Source", "cache");
      }

      res.json({
        status: "success",
        data: { likes },
      });
    } catch (error) {
      next(error);
    }
  }
}
export default LikesHandler;
