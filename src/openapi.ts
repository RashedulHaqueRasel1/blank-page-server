import swaggerAutogen from 'swagger-autogen';
import * as path from 'path';
import * as fs from 'fs';

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
const getPath = (file: string) => path.join(__dirname, isDist ? `../src/${file}` : `./${file}`);

const generateOpenAPI = async () => {
  try {
    if (process.env.NODE_ENV === 'production') return;

    // Generate for each module to avoid path merging issues and inject tags
    const modules = [
      { prefix: '/api/v1/auth', file: 'modules/auth/auth.routes.ts', tag: 'Auth' },
      { prefix: '/api/v1/users', file: 'modules/user/user.routes.ts', tag: 'Users' },
      { prefix: '/api/v1/analytics', file: 'modules/analytics/analytics.routes.ts', tag: 'Analytics' },
      { prefix: '/api/v1/pages', file: 'modules/publish/publish.routes.ts', tag: 'Pages' },
      { prefix: '/api/v1/subscribers', file: 'modules/subscriber/subscriber.routes.ts', tag: 'Subscribers' },
      { prefix: '/api/v1/visitors', file: 'modules/recent-visitors/recent-visitors.routes.ts', tag: 'Visitors' },
    ];

    let combinedPaths: Record<string, any> = {};

    for (const mod of modules) {
      const tempOutputFile = path.join(__dirname, `../openapi_temp_${Date.now()}.json`);
      // Tell swagger-autogen to use openapi 3.0.0
      await swaggerAutogen({ openapi: '3.0.0' })(tempOutputFile, [getPath(mod.file)], doc);
      
      if (fs.existsSync(tempOutputFile)) {
        const tempDoc = JSON.parse(fs.readFileSync(tempOutputFile, 'utf-8'));
        const tempPaths = tempDoc.paths || {};
        
        for (const [routePath, methods] of Object.entries(tempPaths)) {
          // Fix routePath by adding the prefix
          let newPath = `${mod.prefix}${routePath === '/' ? '' : routePath}`;
          if (newPath === '/api/v1/pages' && routePath === '/') newPath = '/api/v1/pages/';
          
          // Inject the folder tag and role prefix into each method (get, post, etc)
          const taggedMethods: Record<string, any> = {};
          for (const [method, details] of Object.entries(methods as any)) {
            // Determine if the route is for admins
            const isAdmin = 
              newPath.includes('/admin/') || 
              newPath.endsWith('/admin') ||
              mod.prefix === '/api/v1/users'; // Fallback just in case
              
            const roleGroup = isAdmin ? 'Admin' : 'User';
            const specificTag = `${roleGroup} API - ${mod.tag}`;
            
            const existingSummary = (details as any).summary || (details as any).description || newPath;
            
            taggedMethods[method] = { 
              ...(details as any), 
              tags: [specificTag],
              summary: existingSummary,
              security: [{ bearerAuth: [] }]
            };
          }
          
          combinedPaths[newPath] = taggedMethods;
        }
        fs.unlinkSync(tempOutputFile);
      }
    }

    // Now generate the base doc to get the root layout
    await swaggerAutogen({ openapi: '3.0.0' })(outputFile, [getPath('app.ts')], doc);
    
    // Merge the custom paths
    if (fs.existsSync(outputFile)) {
      const finalDoc = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
      finalDoc.paths = { ...finalDoc.paths, ...combinedPaths };
      fs.writeFileSync(outputFile, JSON.stringify(finalDoc, null, 2));
      console.log('OpenAPI documentation generated successfully with tags and multiple servers at', outputFile);
    }
  } catch (error) {
    console.error('Error generating OpenAPI documentation', error);
  }
};

export default generateOpenAPI;
