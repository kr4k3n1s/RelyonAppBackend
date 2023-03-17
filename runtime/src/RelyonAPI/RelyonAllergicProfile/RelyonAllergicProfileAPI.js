import { RelyonAllergen, RelyonAllergy } from "./RelyonAllergicProfile";
import { RelyonFood } from "./RelyonAllergicProfile";
import { RelyonGroceries } from "./RelyonAllergicProfile";
import { RelyonInfluences } from "./RelyonAllergicProfile";

import auth from "../RelyonAuth/auth";
import { plainToInstance } from "class-transformer";
const express = require('express');
const router = express.Router();

module.exports = router

router.post('/updateAllergy', express.json({type: '*/*'}), async (req, res, next) => {
    var allergyData = req.body;
    try {
        var allergen = plainToInstance(RelyonAllergy, allergyData, { excludeExtraneousValues: true, exposeUnsetFields: false });
        var result = await allergen.updateOnDatabase();
        if(result){
            res.status(200).send({status: 'success', result: "Record updated."});
        } else {
            res.status(500).send({status: 'not updated', result: "Record is up to date."});
        }
        
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

router.post('/addAllergy', express.json({type: '*/*'}), async (req, res, next) => {
    var allergyData = req.body;
    try {
        var allergen = plainToInstance(RelyonAllergy, allergyData, { excludeExtraneousValues: true, exposeUnsetFields: false });
        var id = await allergen.insertToDatabase();
        res.status(200).send({status: 'success', result: id});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

router.post('/addAllergen', express.json({type: '*/*'}), async (req, res, next) => {
    var allergenJson = req.body;
    try {
        var allergen = plainToInstance(RelyonAllergen, allergenJson, { excludeExtraneousValues: true });
        var id = await allergen.insertToDatabase();
        res.status(200).send({status: 'success', result: id});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

router.get('/allergen', async (req, res, next) => {
    const id = req.query.id;
    try {
        res.status(200).send({status: 'success', result: await RelyonAllergen.initByID(id)});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.post('/listAllergens', async (req, res, next) => {
    const limit = req.query.limit;
    console.log('LIMIT: ' + limit)
    try {
        res.status(200).send({status: 'success', result: await RelyonAllergen.listAll(Number(limit))});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.get('/influence', async (req, res, next) => {
    const id = req.query.id;
    try {
        res.status(200).send({status: 'success', result: await RelyonInfluences.initByID(id)});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.post('/addInfluence', auth, async (req, res, next) => {
    const name = req.query.name;
    try {
        var influence = new RelyonInfluences(name, name.toLowerCase(), true);
        res.status(200).send({status: 'inserted', result: await influence.insetToDatabase()});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.post('/listInfluences', async (req, res, next) => {
    const limit = req.query.limit;
    try {
        res.status(200).send({status: 'success', result: await RelyonInfluences.listAll(Number(limit))});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.get('/food', async (req, res, next) => {
    const id = req.query.id;
    try {
        res.status(200).send({status: 'success', result: await RelyonFood.initByID(id)});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.post('/addFood', auth, async (req, res, next) => {
    const name = req.query.name;
    try {
        var food = new RelyonFood(name, name.toLowerCase(), true);
        res.status(200).send({status: 'inserted', result: await food.insetToDatabase()});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.post('/listFood', async (req, res, next) => {
    const limit = req.query.limit;
    try {
        res.status(200).send({status: 'success', result: await RelyonFood.listAll(Number(limit))});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.get('/grocery', async (req, res, next) => {
    const id = req.query.id;
    try {
        res.status(200).send({status: 'success', result: await RelyonGroceries.initByID(id)});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.post('/addGrocery', auth, async (req, res, next) => {
    const name = req.query.name;
    try {
        var grocery = new RelyonGroceries(name, name.toLowerCase(), true);
        res.status(200).send({status: 'inserted', result: await grocery.insetToDatabase()});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});

router.post('/listGroceries', async (req, res, next) => {
    const limit = req.query.limit;
    try {
        res.status(200).send({status: 'success', result: await RelyonGroceries.listAll(Number(limit))});
    } catch (ex){
        res.status(500).send({status: 'error', result: ex});
    }
});