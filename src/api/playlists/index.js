import PlaylistsHandler from "./handler.js";
import routes from "./routes.js";

export default (service, validator) => {
  const handler = new PlaylistsHandler(service, validator);
  return routes(handler);
};
