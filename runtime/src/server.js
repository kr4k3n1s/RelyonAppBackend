const express = require('express');

const { PORT = '3000' } = process.env
const app = express()
const ver = '0.0.1';
const env = 'DEV';

app.listen(PORT, () => {
    console.log('RelyonApp BACKEND[server node.js] build ver: ' + ver);
    console.log('Server executed and listenes on PORT: ' + PORT);
    console.log('Excecution enviroment: ' + env);
});

const OpenFoodFactsAPI = require('./FoodData/OFFAPI.js');
app.use(OpenFoodFactsAPI);

const RelyonAppAPI = require('./RelyonAPI/RelyonAPI.js');
app.use(RelyonAppAPI);