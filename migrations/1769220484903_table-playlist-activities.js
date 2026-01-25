/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("playlist_song_activities", {
    id: { type: "VARCHAR(50)", primaryKey: true },
    playlist_id: { type: "VARCHAR(50)", notNull: true },
    song_id: { type: "VARCHAR(50)", notNull: true },
    user_id: { type: "VARCHAR(50)", notNull: true },
    action: { type: "VARCHAR(50)", notNull: true },
    time: { type: "VARCHAR(50)", notNull: true },
  });
  // FKs
  pgm.addConstraint(
    "playlist_song_activities",
    "fk_psa.playlist_id",
    "FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE"
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("playlist_song_activities");
};
