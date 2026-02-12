import pg from "pg";
import { nanoid } from "nanoid";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";

const { Pool } = pg;

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    const album = result.rows[0];

    // Logika Cover URL
    if (album.cover) {
      album.coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${album.cover}`;
    }

    delete album.cover;

    // Kriteria Opsional 1: Daftar lagu di dalam detail album
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    return {
      ...album,
      songs: songsResult.rows,
    };
  }

  async editAlbumCoverById(id, filename) {
    const query = {
      text: "UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id",
      values: [filename, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length)
      throw new NotFoundError("Gagal memperbarui cover. Id tidak ditemukan");
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }
}

export default AlbumsService;
