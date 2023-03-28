const express = require('express');
const path = require('path');
const router = express.Router();

const app = express();

const port = process.env.port || 3000;

app.use("public", express.static(__dirname + '/public'));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

router.get('/sample', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/sample.html'));
})

app.use('/', router);

app.listen(port, () => {
    console.log('Running on port ' + port);
});
