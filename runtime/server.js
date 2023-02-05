'use strict'

const express = require('express')

const { PORT = '3000' } = process.env
const app = express()

app.get('/hello', (req, res, next) => {
    var test = req.query.mojparam;
    res.send("Hello world: " + test);
});

app.use((req, res, next) => {
  res.send('Hello Jack')
})

app.listen(PORT, () => {
    console.log('Server has started running at port 3000.');
});