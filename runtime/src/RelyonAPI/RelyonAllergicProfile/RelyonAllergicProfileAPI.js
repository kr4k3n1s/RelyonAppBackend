import { RelyonAllergen, RelyonAllergy, RelyonDBRef, RelyonQuestion } from "./RelyonAllergicProfile";
import { RelyonFood } from "./RelyonAllergicProfile";
import { RelyonGroceries } from "./RelyonAllergicProfile";
import { RelyonInfluences } from "./RelyonAllergicProfile";

import { AdminAuth, UserAuth } from "../RelyonAuth/auth";

import { plainToInstance } from "class-transformer";
const express = require('express');
const router = express.Router();

module.exports = router

router.get('/testQuery', async (req, res, next) => {
    const ref = req.query.ref;
    const qual = req.query.qual;
    try {
        var dbRef = new RelyonDBRef(ref, qual);
        res.status(200).send({status: 'success', result: await dbRef.getReferencedObject()});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

router.get('/questionOptions', async (req, res, next) => {
    const id = req.query.id;
    const filter = req.query.filter;
    try {
        var question = await RelyonQuestion.initByID(id);
        if(!(question instanceof RelyonQuestion)) throw Error('Received object is not a question. Object: ' + JSON.stringify(question));
        var options = await question.getOptions(filter);
        res.status(200).send({status: 'success', result: options});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

router.get('/questionSourceOptions', UserAuth, async (req, res, next) => {
    const id = req.query.id;
    const filter = req.query.filter;
    try {
        var question = await RelyonQuestion.initByID(id);
        if(!(question instanceof RelyonQuestion)) throw Error('Received object is not a question. Object: ' + JSON.stringify(question));
        var options = await question.getSourceOptions(filter);
        res.status(200).send({status: 'success', result: options});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

router.post('/addQuestion', AdminAuth, express.json({type: '*/*'}), async (req, res, next) => {
    var data = req.body;
    try {
        var question = plainToInstance(RelyonQuestion, data, { excludeExtraneousValues: true, exposeUnsetFields: false });
        var id = await question.insertToDatabase();
        res.status(200).send({status: 'success', result: id});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

router.post('/updateQuestion', express.json({type: '*/*'}), async (req, res, next) => {
    var data = req.body;
    try {
        var question = plainToInstance(RelyonQuestion, data, { excludeExtraneousValues: true, exposeUnsetFields: false });
        var id = await question.updateOnDatabase();
        res.status(200).send({status: 'success', result: id});
    } catch (error){
        res.status(500).send({status: 'error', result: error.message});
    }
});

// router.get('/testQuery', async (req, res, next) => {
//     const ref = req.query.ref;
//     try {
//         var result = await new RelyonDBRef(ref).filteredReferToPlain('Hist');
//         res.status(200).send({status: 'success', result: result});
//     } catch (error){
//         res.status(500).send({status: 'error', result: error.message});
//     }
// });

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

router.post('/addInfluence', UserAuth, async (req, res, next) => {
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

router.post('/addFood', UserAuth, async (req, res, next) => {
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

router.post('/addGrocery', UserAuth, async (req, res, next) => {
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