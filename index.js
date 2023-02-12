import express from 'express';
import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL,
});

client.on('error', err => console.log('Redis Client Error', err));

const app = express();
app.use(express.json());

app.get('/liveness', async (req, res) => {
    const requestCount = parseInt(await client.get(REQUEST_COUNT) || 0);

    const { headers } = req;
    const k8sHeaders = Object.keys(headers).filter(key => key.match(/k8s\-.*/g));
    console.log(
        `[${new Date().toISOString()}]`,
        '/liveness called',
        k8sHeaders.reduce((acc, key) => ({ ...acc, [key]: headers[key] }), {}),
        `Request count: ${requestCount}`,
    );

    if (requestCount !== 0 && requestCount % 10 === 0) {
        res.status(400).json({ error: 'Testing probes /liveness' });
        return;
    }

    res.json({});
    return;
});

app.get('/health', async (req, res) => {
    const requestCount = parseInt(await client.get(REQUEST_COUNT) || 0);

    const { headers } = req;
    const k8sHeaders = Object.keys(headers).filter(key => key.match(/k8s\-.*/g));
    console.log(
        `[${new Date().toISOString()}]`,
        '/health called',
        k8sHeaders.reduce((acc, key) => ({ ...acc, [key]: headers[key] }), {}),
        `Request count: ${requestCount}`,
    );

    if (requestCount !== 0 && requestCount % 10 === 0) {
        res.status(400).json({ error: 'Testing probes /health' });
        return;
    }

    res.json({});
    return;
});

const REQUEST_COUNT = 'request-count';

app.get('/*', async (req, res) => {
    const requestCount = await client.get(REQUEST_COUNT) || 0;
    const requestNum = parseInt(requestCount) + 1;

    await client.set(REQUEST_COUNT, requestNum);

    console.log('Incomming request', requestNum);
    const { headers } = req;

    // Write all headers to Redis
    const promises = Object.keys(headers).map(key => client.set(key, headers[key]));
    await Promise.all(promises);

    const envVars = ['TEST_ENV_VARIABLE', 'SECRET_USERNAME', 'SECRET_PASSWORD'];
    const data = {
        path: req.url,
        headers: headers,
        env: envVars
            .reduce((acc, key) => ({ ...acc, [key]: process.env[key] || `"${key}" is not defined.` }), {}),
    };
    if (headers['redis-key']) {
        const value = await client.get(headers['redis-key']);

        data.redis = { [headers['redis-key']]: value };
    }
    res.setHeader('x-request-count', requestNum);
    res.json(data);
    return;
});

process.on('SIGINT', () => {
    client.disconnect();
    process.exit(0);
});

const port = parseInt(process.env.APP_PORT) || 3000;

client.connect()
    .then(async () => {
        await client.set(REQUEST_COUNT, 0);

        app.listen(port, () => {
            console.log(`Server has started on port "${port}"`);
        });
    })
    .catch(console.error);