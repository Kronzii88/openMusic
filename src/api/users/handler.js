class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postUserHandler = this.postUserHandler.bind(this);
  }
  async postUserHandler(req, res, next) {
    try {
      this._validator.validateUserPayload(req.body);
      const userId = await this._service.addUser(req.body);
      res.status(201).json({ status: "success", data: { userId } });
    } catch (error) {
      next(error);
    }
  }
}
export default UsersHandler;
