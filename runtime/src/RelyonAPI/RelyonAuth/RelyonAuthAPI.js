import { Authenticator } from '../RelyonAPI';
import { UserAuth } from './auth';
const express = require('express');
const router = express.Router();

module.exports = router

router.get('/test', async (req, res, next) => {
    const uid = req.query.uid;
    res.status(200).send({status: 'test', result: await Authenticator.test(uid)});
});

router.get('/login', async (req, res, next) => {
    try{
        const pass = req.query.pass;
        const email = req.query.email;
        const verify = req.query.verify;

        const uid = req.query.uid;
        const phone = req.query.phone;
        const code = req.query.code;

        if(pass !== undefined && email !== undefined && verify === undefined) {
            const result = await Authenticator.login(email, pass);
            res.status(200).send({status: 'authorize', result: result});
        } else if(verify === 'true' && uid !== undefined && phone !== undefined && code !== undefined && email !== undefined) {
            const session = await Authenticator.continueLogin(uid, email, phone, code); 
            res.status(200).send({status: 'verified', result: session.result});
        } else {
            throw Error('Your request is invalid, please check and try again.');
        }
    } catch (ex){
        res.status(500).send({status: 'error', messange: ex.toString()});
    }
});

router.post('/register', async (req, res, next) => {
    try{
        const pass = req.query.pass;
        const email = req.query.email;
        const username = req.query.username;
        const phone = req.query.phone;
        if(pass !== undefined && email !== undefined && username !== undefined && phone !== undefined) {
            const session = await Authenticator.registerUser(email, username, pass, phone);
            res.status(200).send({status: 'success', result: session});
        } else {
            throw Error('Required parameter is missing, check for these parameters: pass, email, username');
        }
    } catch (ex){
        res.status(500).send({status: 'error', messange: ex.toString()});
    }
   
});

router.get('/user', UserAuth, async (req, res) => {
    try{
        const uid = req.query.uid;
        if(uid !== undefined) {
            const user = await Authenticator.getUserByID(uid);
            res.status(200).send({status: 'success', result: user});
        } else {
            throw Error('Required parameter is missing, check for these parameters: uid');
        }
    } catch (ex){
        res.status(500).send({status: 'error', messange: ex.toString()});
    }
});

router.get('/userProfile', UserAuth, async (req, res) => {
    try{
       res.status(200).send({status: 'success', result: await Authenticator.userProfile(req.user.uid)});
    } catch (ex){
        res.status(500).send({status: 'error', messange: ex.toString()});
    }
});

router.post('/verifySession', async (req, res) => {
    try {
        const uid = req.query.uid;
        const session = req.query.session;
        if(uid !== undefined && session !== undefined) {
            const result = await Authenticator.verifySession(session, uid);
            res.status(200).send({status: 'verified', result: result});
        } else {
            throw Error('Required parameter is missing, check for these parameters: uid');
        }
    } catch (ex){
        res.status(500).send({status: 'error', messange: ex.toString()});
    }
});

router.get('/tokenUser', UserAuth, async (req, res) => {
    try {
        res.status(200).send({status: 'verified', result: req.user});
    } catch (ex){
        res.status(500).send({status: 'error', messange: ex.toString()});
    }
});

router.get('/getUser', UserAuth, async (req, res) => {
    try{
        const filterField = req.query.filter_field;
        const filterValue = req.query.filter_value;
        if(filterField !== undefined && filterValue !== undefined) {
            const user = await Authenticator.getUser(filterField, filterValue);
            res.status(200).send({status: 'success', result: user});
        } else {
            throw Error('Required parameter is missing, check for these parameters: pass, email, username');
        }
    } catch (ex){
        res.status(500).send({status: 'error', messange: ex.toString()});d
    }
});

