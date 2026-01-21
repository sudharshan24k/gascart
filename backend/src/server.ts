import app from './app'; // Force restart
import { config } from './config/env';

const port = config.port;

const startServer = (p: number | string) => {
    const server = app.listen(p, () => {
        console.log(`Server running on port ${p}`);
    });

    server.on('error', (e: any) => {
        if (e.code === 'EADDRINUSE') {
            console.log(`Port ${p} is in use, trying ${Number(p) + 1}...`);
            startServer(Number(p) + 1);
        } else {
            console.error('Server error:', e);
        }
    });
};

startServer(port);
