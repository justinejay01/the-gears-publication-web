const express = require('express');
const path = require('path');
const router = express.Router();

const app = express();
const port = process.env.port || 3000;

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.use('/', router);
app.use('/static', express.static(path.join(__dirname + 'static')));
app.listen(port, () => {
    console.log('Running on port ' + port);
});
