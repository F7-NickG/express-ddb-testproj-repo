const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const productRouter = require('./routes/product');

app.use(express.json());
app.use('/product', productRouter);

app.get('/', (req, res) => {
    res.status(200);
    res.send('<h1>Node.js CRUD API</h1> <h4>Message: Success</h4> <p>Version 1.0</p>');
});

app.get('/health', (req, res) => {
    res.status(200);
    res.send(`App status code: ${res.statusCode}`);
});

app.listen(PORT, () => {
   console.log('Tester App running and listening on port: ' + PORT);
});