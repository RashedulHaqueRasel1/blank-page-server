"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const doc = {
    openapi: '3.0.0',
    info: {
        title: 'Blank Page API',
        description: 'API documentation for Blank Page Server',
        version: '1.0.0',
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Development Server',
        },
        {
            url: 'https://blank-page-server.onrender.com',
            description: 'Production Server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token here to authenticate your requests.',
            },
        },
    },
};
const outputFile = path.join(__dirname, '../openapi.json');
const isDist = __dirname.endsWith('dist');
const getPath = (file) => path.join(__dirname, isDist ? `../src/${file}` : `./${file}`);
const generateOpenAPI = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (process.env.NODE_ENV === 'production')
            return;
        // Generate for each module to avoid path merging issues and inject tags
        const modules = [
            { prefix: '/api/v1/auth', file: 'modules/auth/auth.routes.ts', tag: 'Auth' },
            { prefix: '/api/v1/users', file: 'modules/user/user.routes.ts', tag: 'Users' },
            { prefix: '/api/v1/analytics', file: 'modules/analytics/analytics.routes.ts', tag: 'Analytics' },
            { prefix: '/api/v1/pages', file: 'modules/publish/publish.routes.ts', tag: 'Pages' },
            { prefix: '/api/v1/subscribers', file: 'modules/subscriber/subscriber.routes.ts', tag: 'Subscribers' },
            { prefix: '/api/v1/visitors', file: 'modules/recent-visitors/recent-visitors.routes.ts', tag: 'Visitors' },
        ];
        let combinedPaths = {};
        for (const mod of modules) {
            const tempOutputFile = path.join(__dirname, `../openapi_temp_${Date.now()}.json`);
            // Tell swagger-autogen to use openapi 3.0.0
            yield (0, swagger_autogen_1.default)({ openapi: '3.0.0' })(tempOutputFile, [getPath(mod.file)], doc);
            if (fs.existsSync(tempOutputFile)) {
                const tempDoc = JSON.parse(fs.readFileSync(tempOutputFile, 'utf-8'));
                const tempPaths = tempDoc.paths || {};
                for (const [routePath, methods] of Object.entries(tempPaths)) {
                    // Fix routePath by adding the prefix
                    let newPath = `${mod.prefix}${routePath === '/' ? '' : routePath}`;
                    if (newPath === '/api/v1/pages' && routePath === '/')
                        newPath = '/api/v1/pages/';
                    // Inject the folder tag and role prefix into each method (get, post, etc)
                    const taggedMethods = {};
                    for (const [method, details] of Object.entries(methods)) {
                        // Determine if the route is for admins
                        const isAdmin = newPath.includes('/admin/') ||
                            newPath.endsWith('/admin') ||
                            mod.prefix === '/api/v1/users'; // Fallback just in case
                        const roleGroup = isAdmin ? 'Admin' : 'User';
                        const specificTag = `${roleGroup} API - ${mod.tag}`;
                        const existingSummary = details.summary || details.description || newPath;
                        taggedMethods[method] = Object.assign(Object.assign({}, details), { tags: [specificTag], summary: existingSummary, security: [{ bearerAuth: [] }] });
                    }
                    combinedPaths[newPath] = taggedMethods;
                }
                fs.unlinkSync(tempOutputFile);
            }
        }
        // Now generate the base doc to get the root layout
        yield (0, swagger_autogen_1.default)({ openapi: '3.0.0' })(outputFile, [getPath('app.ts')], doc);
        // Merge the custom paths
        if (fs.existsSync(outputFile)) {
            const finalDoc = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
            finalDoc.paths = Object.assign(Object.assign({}, finalDoc.paths), combinedPaths);
            fs.writeFileSync(outputFile, JSON.stringify(finalDoc, null, 2));
            console.log('OpenAPI documentation generated successfully with tags and multiple servers at', outputFile);
        }
    }
    catch (error) {
        console.error('Error generating OpenAPI documentation', error);
    }
});
exports.default = generateOpenAPI;
