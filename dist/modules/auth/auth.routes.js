"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_validation_1 = require("./auth.validation");
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
router.post('/register', 
/*  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      email: { type: "string", example: "user@example.com" },
                      password: { type: "string", example: "strongpassword123" },
                      role: { type: "string", example: "AUTHOR" }
                  },
                  required: ["email", "password"]
              }
          }
      }
  }
*/
(0, validateRequest_1.default)(auth_validation_1.AuthValidation.register), auth_controller_1.AuthController.registerUser);
router.post('/login', 
/*  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      email: { type: "string", example: "user@example.com" },
                      password: { type: "string", example: "strongpassword123" }
                  },
                  required: ["email", "password"]
              }
          }
      }
  }
*/
(0, validateRequest_1.default)(auth_validation_1.AuthValidation.login), auth_controller_1.AuthController.loginUser);
router.get('/profile', (0, auth_1.default)(), auth_controller_1.AuthController.getProfile);
exports.default = router;
