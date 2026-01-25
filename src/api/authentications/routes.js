import express from "express";

const routes = (handler) => {
  const router = express.Router();

  // POST /authentications -> Login
  router.post("/", handler.postAuthenticationHandler);

  // PUT /authentications -> Refresh Access Token
  router.put("/", handler.putAuthenticationHandler);

  // DELETE /authentications -> Logout (Hapus Refresh Token)
  router.delete("/", handler.deleteAuthenticationHandler);

  return router;
};

export default routes;
