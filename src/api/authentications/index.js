import AuthenticationsHandler from "./handler.js";
import routes from "./routes.js";

export default (
  authenticationsService,
  usersService,
  tokenManager,
  validator
) => {
  const handler = new AuthenticationsHandler(
    authenticationsService,
    usersService,
    tokenManager,
    validator
  );
  return routes(handler);
};
