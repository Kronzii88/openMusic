import pg from "pg";
import { nanoid } from "nanoid";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js"; // Pastikan import ini ada

const { Pool } = pg;

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    // Cek album ada
    await this.checkAlbumExists(albumId);
    // Cek sudah like belum
    await this.checkIsLiked(userId, albumId);

    const id = `like-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) throw new InvariantError("Gagal menyukai album");

    // Hapus cache agar data terbaru diambil dari DB saat GET
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length)
      throw new NotFoundError("Gagal batal menyukai. Like tidak ditemukan");

    // Hapus cache
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikes(albumId) {
    try {
      // Coba ambil dari cache
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: JSON.parse(result),
        isCache: true,
      };
    } catch (error) {
      // Jika gagal, ambil dari DB
      await this.checkAlbumExists(albumId);

      const query = {
        text: "SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1",
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].count, 10);

      // Simpan ke cache
      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(likes));

      return {
        likes,
        isCache: false,
      };
    }
  }

  async checkIsLiked(userId, albumId) {
    const query = {
      text: "SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    if (result.rows.length > 0)
      throw new InvariantError("Anda sudah menyukai album ini");
  }

  async checkAlbumExists(id) {
    const query = { text: "SELECT * FROM albums WHERE id = $1", values: [id] };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new NotFoundError("Album tidak ditemukan");
  }
}

export default LikesService;
