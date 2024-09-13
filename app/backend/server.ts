// server.ts
import express from 'express';
import next from 'next';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
// Import your functions
import signup from './signup';
import login from './login';
import { createProject,updateProject, deleteProject, getProjects } from './projects'; // Import additional project functions

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    server.use(bodyParser.json());
    server.use(cookieParser());

    // Attach route handlers
    server.post('/api/signup', signup);
    server.post('/api/login', login);
    server.post('/api/create-project', createProject);
    server.put('/api/update-project', updateProject); // Handle project update
    server.delete('/api/delete-project', deleteProject); // Handle project deletion
    server.get('/api/projects', getProjects); // Fetch projects

    // Catch-all for Next.js pages
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    const port = process.env.PORT || 3000;
    server.listen(port, (err?: any) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
