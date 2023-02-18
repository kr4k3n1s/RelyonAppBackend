import {MongoClient, ObjectId, Timestamp} from 'mongodb';
import { randomUUID } from 'crypto';

import crypto = require('crypto');


export interface RelyonAuth {
    client: MongoClient;
}

export class RelyonAuth {

    constructor(client: MongoClient){
        this.client = client;
    }
 
    async createCredentials(plainPass: string): Promise<ObjectId> {
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Credentials')
        const uid = new ObjectId(crypto.randomBytes(12).toString("hex"));
        await col.insertOne({
            _id: uid,
            uid: uid,
            password: crypto.createHash('md5').update(plainPass).digest('hex'),
            token: crypto.randomBytes(12).toString("hex"),
        })
        return uid;
    }

    async registerUser(email: string, username: string, password: string){
        const credentials = await this.createCredentials(password);
        const connection = await this.client.connect();
        const col = connection.db('RelyonApp').collection('Users');
        await col.insertOne({
            uid: credentials,
            password: crypto.createHash('md5').update(password).digest('hex'),
            username: username,
            email: email,
            created_on: Timestamp.fromNumber(Date.now()),
        })
    }


}