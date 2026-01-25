import Joi from "joi";

// Schema untuk Login
const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Schema untuk Refresh Token (PUT)
const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Schema untuk Logout (DELETE)
const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};
