import {MongoClient, ObjectId} from 'mongodb';
import {RelyonAuth} from './RelyonAuth/RelyonAuth';

const OpenFoodFactsAPI = require('../FoodData/OFFAPI.js');
const RelyonAuthAPI = require('./RelyonAuth/RelyonAuthAPI.js');
const RelyonAllergyProfile = require('./RelyonAllergicProfile/RelyonAllergicProfileAPI.js');
const RelyonDatabaseAPI = require('./RelyonDatabase/RelyonDatabaseAPI.js');

export const DBRUL = 'mongodb://root:rootpassword@mongodb_container:27017/?authMechanism=DEFAULT';
export const DBClient = new MongoClient(DBRUL);
export const Authenticator = new RelyonAuth(DBClient);

export interface RelyonAPI {
    app: any;
}

export class RelyonAPI {
    
    constructor(app: any){
        this.app = app;
        
    }

    attachServices(){
        this.app.use(RelyonDatabaseAPI)
        this.app.use(OpenFoodFactsAPI);
        this.app.use(RelyonAuthAPI);
        this.app.use(RelyonAllergyProfile);
    }

}