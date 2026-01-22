const express = require('express');
const cors = require('cors');
const uploadController = require('./controllers/uploadController');


const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'https://onlaveo.com',
    credentials: true
}));

// upload3.php 역할
app.post('/upload', uploadController);

app.listen(PORT, () => {
    console.log(`🚀 Node Upload Server running on http://localhost:${PORT}`);
});
