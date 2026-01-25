import express from "express";
const router = express.Router();

const routes = (handler) => {
  router.post("/", handler.postUserHandler);
  return router;
};
export default routes;
