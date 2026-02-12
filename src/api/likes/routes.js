import express from "express";

const routes = (handler) => {
  const router = express.Router();

  router.post("/:id/likes", handler.postLikeHandler);
  router.delete("/:id/likes", handler.deleteLikeHandler);
  router.get("/:id/likes", handler.getLikesHandler);

  return router;
};

export default routes;
