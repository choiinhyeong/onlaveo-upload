const express = require('express');
const cors = require('cors');
const uploadController = require('./controllers/uploadController');


const app = express();
const PORT = 3000;

// PHP처럼 multipart/form-data 받기
app.use(cors());

// upload3.php 역할
app.post('/upload', uploadController);

app.listen(PORT, () => {
    console.log(`🚀 Node Upload Server running on http://localhost:${PORT}`);
});
