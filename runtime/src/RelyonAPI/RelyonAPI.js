import {MongoClient} from 'mongodb';
const {RelyonAuth} = require('./UserServices.ts');

const express = require('express');
const router = express.Router();

module.exports = router

const url = 'mongodb://root:rootpassword@mongodb_container:27017/?authMechanism=DEFAULT';
const client = new MongoClient(url);

router.get('/testConnection', async (req, res, next) => {
    const pass = req.query.pass;
    const auth = new RelyonAuth(client);
    if(pass === undefined) {
        res.status(501).send('Pass undefined');
        return;
    }
    await auth.createCredentials(pass);
    res.status(200).send('User succesfuly registerd.');
});
