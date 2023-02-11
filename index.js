import http from 'http';
import { createClient } from 'redis';

const client = createClient({
    url: 'redis://redis-service:6379',
});

client.on('error', err => console.log('Redis Client Error', err));

const server = http.createServer(async (req, res) => {
    console.log('Incomming request');
    const { headers } = req;

    // Write all headers to Redis
    const promises = Object.keys(headers).map(key => client.set(key, headers[key]));
    await Promise.all(promises);

    res.write(`Requested path: ${req.url}\n`);
    res.write(`Requested headers: ${JSON.stringify(req.headers)}\n`);

    if (headers['redis-key']) {
        const value = await client.get(headers['redis-key']);
        res.write(`Redis value: ${value}\n`);
    }
    res.end();
});


process.on('SIGINT', () => {
    client.disconnect();
    process.exit(0);
});

const port = 3000;

client.connect()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server has started on port "${port}"`);
        });
    })
    .catch(console.error);