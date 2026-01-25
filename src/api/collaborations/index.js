import CollaborationsHandler from "./handler.js";
import routes from "./routes.js";

export default (collaborationsService, playlistsService, validator) => {
  const handler = new CollaborationsHandler(
    collaborationsService,
    playlistsService,
    validator
  );
  return routes(handler);
};
