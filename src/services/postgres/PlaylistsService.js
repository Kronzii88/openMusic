import pg from "pg";
import { nanoid } from "nanoid";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import AuthorizationError from "../../exceptions/AuthorizationError.js";

const { Pool } = pg;

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id)
      throw new InvariantError("Playlist gagal ditambahkan");
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    // Left join untuk mengambil playlist milik sendiri DAN kolaborasi
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
             LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
             LEFT JOIN users ON users.id = playlists.owner
             WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length)
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `ps-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length)
      throw new InvariantError("Lagu gagal ditambahkan ke playlist");
  }

  async getSongsFromPlaylist(playlistId) {
    // Ambil detail playlist dulu
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
               LEFT JOIN users ON users.id = playlists.owner
               WHERE playlists.id = $1`,
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rows.length)
      throw new NotFoundError("Playlist tidak ditemukan");

    // Ambil lagunya
    const songsQuery = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
               JOIN playlist_songs ON playlist_songs.song_id = songs.id
               WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);

    return { ...playlistResult.rows[0], songs: songsResult.rows };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length)
      throw new InvariantError("Lagu gagal dihapus dari playlist");
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length)
      throw new NotFoundError("Playlist tidak ditemukan");
    const playlist = result.rows[0];
    if (playlist.owner !== owner)
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, a.action, a.time 
                 FROM playlist_song_activities a
                 JOIN users ON a.user_id = users.id
                 JOIN songs ON a.song_id = songs.id
                 WHERE a.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `act-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)",
      values: [id, playlistId, songId, userId, action, time],
    };
    await this._pool.query(query);
  }
}
export default PlaylistsService;
