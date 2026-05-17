"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const document_validation_1 = require("./document.validation");
const document_controller_1 = require("./document.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(), (0, validateRequest_1.default)(document_validation_1.DocumentValidation.createDocument), document_controller_1.DocumentController.createDocument);
router.get('/', (0, auth_1.default)(), document_controller_1.DocumentController.getAllDocuments);
router.get('/:id', (0, auth_1.default)(), document_controller_1.DocumentController.getSingleDocument);
router.patch('/:id', (0, auth_1.default)(), (0, validateRequest_1.default)(document_validation_1.DocumentValidation.updateDocument), document_controller_1.DocumentController.updateDocument);
router.delete('/:id', (0, auth_1.default)(), document_controller_1.DocumentController.deleteDocument);
exports.DocumentRoutes = router;
