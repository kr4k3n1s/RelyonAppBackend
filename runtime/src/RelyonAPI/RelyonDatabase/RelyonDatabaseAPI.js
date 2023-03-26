import { RelyonDBRef } from './RelyonDatabase';

const express = require('express');
const router = express.Router();

module.exports = router

router.get('/referencedObject', async (req, res, next) => {
    const ref = req.query.ref;
    const filter = req.query.filter;
    try {
        var dbRef = new RelyonDBRef(ref);
        dbRef.requireSpecificReference();
        var object = await dbRef.getReferencedObject(filter);
        res.status(200).send({status: 'success', result: object});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

router.get('/underlayingObjects', async (req, res, next) => {
    const ref = req.query.ref;
    const filter = req.query.filter;
    try {
        var dbRef = new RelyonDBRef(ref);
        var objects = await dbRef.getUnderlayingObjects(filter)
        res.status(200).send({status: 'success', result: objects});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});