import dotenv from "dotenv";
dotenv.config();

import express from "express";
import albumsRouter from "./api/albums/routes.js";
import songsRouter from "./api/songs/routes.js";
import ClientError from "./exceptions/ClientError.js";

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.use(express.json());

// Registrasi Routes
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
