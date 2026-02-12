import ExportsHandler from "./handler.js";
import routes from "./routes.js";

export default (producerService, playlistsService, validator) => {
  const handler = new ExportsHandler(
    producerService,
    playlistsService,
    validator
  );
  return routes(handler);
};
