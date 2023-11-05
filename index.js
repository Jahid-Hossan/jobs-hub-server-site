const express = require('express');
const app = express();


const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Jobs-Hub server running')
})

app.listen(port, () => {
    console.log(`Jobs-Hub server is running on port ${port}`)
})