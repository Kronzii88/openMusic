import express from "express";
import multer from "multer";

const upload = multer({
  limits: { fileSize: 512000 }, // 512KB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image/)) {
      cb(new Error("Type file harus gambar"), false);
    } else {
      cb(null, true);
    }
  },
});

const routes = (handler) => {
  const router = express.Router();
  router.post(
    "/albums/:id/covers",
    upload.single("cover"),
    handler.postUploadImageHandler
  );
  return router;
};
export default routes;
