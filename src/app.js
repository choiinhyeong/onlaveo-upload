const express = require('express');
const cors = require('cors');

const uploadRouter = require('./routes/upload');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/upload', uploadRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

module.exports = app;
