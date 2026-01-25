import dotenv from "dotenv";
dotenv.config();

import express from "express";
import albumsRouter from "./api/albums/routes.js";
import songsRouter from "./api/songs/routes.js";
import ClientError from "./exceptions/ClientError.js";
import users from "./api/users/index.js";
import authentications from "./api/authentications/index.js";
import playlists from "./api/playlists/index.js";
import collaborations from "./api/collaborations/index.js";

import UsersService from "./services/postgres/UsersService.js";
import AuthenticationsService from "./services/postgres/AuthenticationsService.js";
import PlaylistsService from "./services/postgres/PlaylistsService.js";
import CollaborationsService from "./services/postgres/CollaborationsService.js";
import TokenManager from "./tokenize/TokenManager.js";

import UsersValidator from "./validator/users/index.js";
import AuthenticationsValidator from "./validator/authentications/index.js";
import PlaylistsValidator from "./validator/playlists/index.js";
import CollaborationsValidator from "./validator/collaborations/index.js";
import AuthenticationError from "./exceptions/AuthenticationError.js";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.use(express.json());

app.use((req, res, next) => {
  // Lewati auth untuk login/register/public routes jika perlu,
  // atau terapkan logika ini HANYA di dalam handler/router spesifik.
  // Cara paling aman di Express tanpa Hapi Plugin adalah menggunakan middleware
  // pada router tertentu. Lihat implementasi di bawah.
  next();
});

const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService(collaborationsService);
const usersService = new UsersService();
const authenticationsService = new AuthenticationsService();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return next(new AuthenticationError("Missing authentication"));

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
    if (err) return next(new AuthenticationError("Invalid token"));
    req.user = user;
    next();
  });
};

// Registrasi Routes
app.use("/users", users(usersService, UsersValidator));
app.use(
  "/authentications",
  authentications(
    authenticationsService,
    usersService,
    TokenManager,
    AuthenticationsValidator
  )
);

app.use(
  "/playlists",
  authenticateToken,
  playlists(playlistsService, PlaylistsValidator)
);

app.use(
  "/collaborations",
  authenticateToken,
  collaborations(
    collaborationsService,
    playlistsService,
    CollaborationsValidator
  )
);
app.use("/albums", albumsRouter);
app.use("/songs", songsRouter);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: "error",
    message: "Terjadi kegagalan pada server kami",
  });
});

app.listen(port, host, () => {
  console.log(`Server berjalan pada http://${host}:${port}`);
});
