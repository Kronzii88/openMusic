import UploadsHandler from "./handler.js";
import routes from "./routes.js";

export default (service, albumsService, validator) => {
  const handler = new UploadsHandler(service, albumsService, validator);
  return routes(handler);
};
