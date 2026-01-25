import express from "express";

const routes = (handler) => {
  const router = express.Router();

  router.post("/", handler.postCollaborationHandler);
  router.delete("/", handler.deleteCollaborationHandler);

  return router;
};

export default routes;
