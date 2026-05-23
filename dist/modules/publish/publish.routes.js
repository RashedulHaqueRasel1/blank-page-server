"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const publish_controller_1 = require("./publish.controller");
const router = express_1.default.Router();
// Public route to publish a new page
router.post('/create', 
/*  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      customUrl: { type: "string", example: "my-secret-page" },
                      title: { type: "string", example: "Secret Notes" },
                      content: { type: "string", example: "Hello world!" },
                      password: { type: "string", example: "optional123" },
                      authorId: { type: "string", example: "user-123" },
                      isEditable: { type: "boolean", example: true },
                      oneTimeView: { type: "boolean", example: false },
                      expiresHours: { type: "number", example: 24 }
                  }
              }
          }
      }
  }
*/
publish_controller_1.PublishController.publishPage);
// Admin-only route to list all published pages
router.get('/admin/all-pages', (0, auth_1.default)('ADMIN'), publish_controller_1.PublishController.getAllPagesAdmin);
// Route to get published pages by author ID
router.get('/author/:authorId/list', publish_controller_1.PublishController.getPagesByAuthor);
// Route for author to securely update page title, pin status, or content
router.put('/:customUrl/secure-update', 
/*  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      authorId: { type: "string", example: "user-123" },
                      title: { type: "string", example: "Updated Title" },
                      content: { type: "string", example: "Updated content" },
                      pinned: { type: "boolean", example: true }
                  },
                  required: ["authorId"]
              }
          }
      }
  }
*/
publish_controller_1.PublishController.updatePageByAuthor);
// Route for author to securely fetch full page content (bypassing password)
router.post('/:customUrl/secure-fetch', 
/*  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      authorId: { type: "string", example: "user-123" }
                  },
                  required: ["authorId"]
              }
          }
      }
  }
*/
publish_controller_1.PublishController.fetchPageByAuthor);
// Public route to retrieve a page by its custom URL
router.get('/:customUrl/view', publish_controller_1.PublishController.getPageByUrl);
// Public route to update an editable page
router.patch('/:customUrl/public-edit', 
/*  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      content: { type: "string", example: "New content addition" }
                  },
                  required: ["content"]
              }
          }
      }
  }
*/
publish_controller_1.PublishController.updatePageContent);
// Route to soft delete a page
router.delete('/:customUrl/delete', publish_controller_1.PublishController.softDeletePage);
// Route to verify password for a protected page
router.post('/:customUrl/verify-password', 
/*  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      password: { type: "string", example: "secret123" }
                  },
                  required: ["password"]
              }
          }
      }
  }
*/
publish_controller_1.PublishController.verifyPagePassword);
exports.default = router;
