import LikesHandler from "./handler.js";
import routes from "./routes.js";

export default (service) => {
  const handler = new LikesHandler(service);
  return routes(handler);
};
