import UsersHandler from "./handler.js";
import routes from "./routes.js";

export default (service, validator) => {
  const handler = new UsersHandler(service, validator);
  return routes(handler);
};
