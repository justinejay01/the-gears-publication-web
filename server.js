const e = require('express');
const app = e();
const port = 8081;

app.get('/', (req, res)) {
    res.send("Test");
}

app.listen(port, () => {
    console.log("Running on port 8081");
})