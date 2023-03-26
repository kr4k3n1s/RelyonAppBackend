import {MongoClient, ObjectId, Timestamp} from 'mongodb';
import { randomUUID } from 'crypto';

import crypto = require('crypto');
import Twilio = require('twilio');
const jwt = require('jsonwebtoken');


export class RelyonComm {

    accountSid = "ACd74738727685de4467a52467e014fb26";
    authToken = "4f1d4b91b8f93f51b4ecf6ec044df8d2";
    verifySid = "VAbe48c6e40a5d450d48326ea547c209c5";
    client = Twilio(this.accountSid, this.authToken);

    async requestLoginVerification(userPhone: string){
        const verification = await this.client.verify.v2.services(this.verifySid).verifications.create({ to: '+' + userPhone, channel: "sms" })
        return verification.status;
    }

    async verifyLogin(userPhone: string, code: string){
        console.log('VERIFICATION FOR PHONE: ' + userPhone + ' WITH CODE: ' + code);
        const verification = await this.client.verify.v2.services(this.verifySid).verificationChecks.create({ to: '+' + userPhone, code: code })
        console.log('VERIFICATION STATUS: ' + verification.status)
        return verification.status;
    }

}

export interface RelyonAuth {
    client: MongoClient;
}

export interface User {
    uid: string;
    email: string;
    username: string;
    phone: string;
}

export interface AppSession {
    user: User;
    session: string;
}

export interface UserProfile {
    uid: ObjectId;
    email: string;
    username: string;
    phone: string;
    name: string;
    surname: string;
    profilePicture: string;
}

export class RelyonAuth {

    constructor(client: MongoClient){
        this.client = client;
    }

    async getUserForSession(session: string): Promise<User>{
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Users');
        const result = await col.findOne({session: session});
        if(result == null) throw Error(`Could not find such a user with provided data.`);
        return {uid: result.uid, email: result.email, username: result.username, phone: result.phone};
    }

    async getUserByID(uid: string): Promise<User>{
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Users');
        const result = await col.findOne({"uid": new ObjectId(uid)});
        if(result == null) throw Error(`Could not find such a user with provided data. (uid: ${uid})`);
        return {uid: result.uid, email: result.email, username: result.username, phone: result.phone};
    }

    async getUser(byField: string, withValue: string): Promise<User>{
        if(byField === 'session') { throw Error('Unable to execute such a operation.')}
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Users'); 
        const result = await col.findOne({[byField]: withValue});
        if(result == null) throw Error(`Could not find such a user with provided data. (byField: ${byField}, withValue: ${withValue})`);
        return {uid: result.uid, email: result.email, username: result.username, phone: result.phone};
    }

    async createCredentials(email: string, plainPass: string, phone: string): Promise<{ id: ObjectId, secret: string}> {
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Credentials')
        const uid = new ObjectId(crypto.randomBytes(12).toString("hex"));
        const secret = crypto.randomBytes(12).toString("hex");
        await col.insertOne({
            _id: uid,
            uid: uid,
            email: crypto.createHash('sha256').update(email).digest('hex'),
            phone: phone,
            password: crypto.createHash('sha256').update(plainPass).digest('hex'),
            secret: secret,
        })
        return {id: uid, secret: secret};
    }

    async verifyEmail(email: string): Promise<boolean> {
        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) throw Error('This email is invalid, please check and rewrite address.');
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Users');
        const result = await col.findOne({email: email});
        if(result !== null) throw Error('This email is already in use, please use another email.');
        return result === null;
    }

    async verifySession(session: string, uid: string): Promise<{ session: string, token: string}> {
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Users');
        const result = await col.findOne({uid: new ObjectId(uid), session: session});
        if(result == null) throw Error('Invalid session provided.');
        console.log('isAdmin: ' + result.isAdmin);
        const token = jwt.sign({uid: result.uid, email: result.email, username: result.username, phone: result.phone, isAdmin: result.isAdmin}, "RANDOM-TOKEN", {expiresIn: "24h"});
        return {session: session, token: token};
    }

    async registerUser(email: string, username: string, password: string, phone: string): Promise<{ session: string; token: string; }>{
        try {
            await this.verifyEmail(email);
            const credentials = await this.createCredentials(email, password, phone);
            const connection = await this.client.connect();
            const col = connection.db('RelyonApp').collection('Users');
            const session = crypto.randomBytes(12).toString("hex")

            const token = jwt.sign(
                {
                    uid: credentials.id,
                    email: email,
                    phone: phone,
                    session: session,
                },
                "RANDOM-TOKEN",
                { expiresIn: "24h" }
            );

            await col.insertOne({
                uid: credentials.id,
                username: username,
                email: email,
                phone: phone,
                created_on: Timestamp.fromNumber(Date.now()),
                last_login: Timestamp.fromNumber(Date.now()),
                session: session,
            })
            return {session: session, token: token};
        } catch(ex) {
            throw ex;
        }
    }

    async verifyCredentials(email: string, password: string): Promise<{ uid: string; phone: string; }> {
        try {
            const connection = await this.client.connect();
            const col = connection.db('RelyonApp').collection('Credentials');
            const result = await col.findOne({'password': crypto.createHash('sha256').update(password).digest('hex'), 'email': crypto.createHash('sha256').update(email).digest('hex')});
            if (!result) throw Error('Credentials are incorrect or could not be verified.');
            return {uid: result['uid'], phone: result['phone']};
        } catch(ex) {
            throw ex;
        }
    }

    async test(uid: string){
        const session = crypto.randomBytes(12).toString("hex");
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Users');
        const result = await col.updateOne({uid: new ObjectId(uid)}, { $set: { session: session, last_login: Timestamp.fromNumber(Date.now())}});
        console.log('WRITTEN: ' + result.matchedCount);
        return session;
    }

    async continueLogin(uid: string, email: string, phone: string, code: string): Promise<{ status: string; result: { session: string; token: string; }; }>{
        const commModule = new RelyonComm();
        const status = await commModule.verifyLogin(phone, code);
        if(status === 'approved'){
            const session = crypto.randomBytes(12).toString("hex");
            const connection = await this.client.connect();
            const col = connection.db('RelyonApp').collection('Users');
            const result = await col.updateOne({uid: new ObjectId(uid)}, { $set: { session: session, last_login: Timestamp.fromNumber(Date.now())}});
            const token = jwt.sign(
                {
                    uid: uid,
                    email: email,
                    phone: phone,
                    session: session,
                },
                "RANDOM-TOKEN",
                { expiresIn: "24h" }
            );
            return { status: status, result: { session: session, token: token} };
        } else {
            throw Error('Provided verification parameters are invalid or could not be verified!');
        }
    }

    async login(email: string, password: string): Promise<{uid: string, email: string, phone: string; status: string; }>{
        try {
            const user = await this.verifyCredentials(email, password);
            const commModule = new RelyonComm();
            const status = await commModule.requestLoginVerification(user.phone);
            return {uid: user.uid, email: email, phone: user.phone, status: status};
        } catch(ex) {
            throw ex;
        }
    }

    async userProfile(uid: string): Promise<UserProfile | null> {
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection<UserProfile>('Users');
        const result = await col.findOne({uid: new ObjectId(uid)});
        return result;
    }


}