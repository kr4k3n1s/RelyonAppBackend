import { plainToClass, plainToInstance, Expose, Type, Transform, Exclude } from "class-transformer";
import { ObjectId } from "mongodb";
import { DBObject, JSONConvertible } from "../../Framework/RelyonCore";
import { DBClient } from "../RelyonAPI";
import { RelyonDBChoiceObject, RelyonDBRef } from "../RelyonDatabase/RelyonDatabase";


// ! Allergen Class

export interface RelyonAllergen {
    _id?: ObjectId;
    name: string;
    icon?: string;
    iconURL?: string;
    lowercase: string;
    preDefined: boolean;
    author?: ObjectId;
}

export class RelyonAllergen implements JSONConvertible, DBObject {
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    _id?: ObjectId;
    @Expose() name: string;
    @Expose() icon?: string;
    @Expose() @Transform(({ value }) => value ? value : undefined)
    iconURL?: string;
    @Expose() lowercase: string;
    @Expose() preDefined: boolean;
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    author?: ObjectId;

    constructor(name: string, lowercase: string, preDefined: boolean, id?: ObjectId){
        this._id = id;
        this.name = name;
        this.lowercase = lowercase;
        this.preDefined = preDefined;
    }

    isPartial(): boolean {
        return (typeof this.name == "string" && typeof this.lowercase == "string"  && typeof this.preDefined == "boolean");
    }

    isComplete(): boolean {
        return (this._id instanceof ObjectId && typeof this.name == "string" && typeof this.lowercase == "string"  && typeof this.preDefined == "boolean" && typeof this.icon == 'string' && typeof this.iconURL == 'string' && this._id instanceof ObjectId);
    }


    static async initByID(id: string): Promise<RelyonAllergen> {
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Allergens');
        var result = await col.findOne<RelyonAllergen>({_id: new ObjectId(id)});
        if(result == null) throw Error(`Could not find such a allergen with provided id.`);
        return result;
    }

    async insertToDatabase(includeIfFound?: boolean): Promise<ObjectId> {
        if (!this.isPartial()) throw new Error('Object of allergen is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Allergens');
        const exists = await col.find({ $or: [ {name: this.name}, {_id: this._id} ] }).toArray();

        if(exists.length > 1 && !includeIfFound) throw new Error('Multiple Allergens found for id: ' + this._id + ', name: ' + this.name + '. Probably mismatched name and id?');
        if(exists.length > 0 && !includeIfFound) throw new Error('Allergen with this name or id already exists');
        if(exists != undefined && exists.length > 0) return exists[0]._id;

        const result = await col.insertOne(this);
        if(result == null) throw Error(`Could not insert allergen to Database.`);
        return result.insertedId;
    }

    async updateOnDatabase(): Promise<boolean> {
        if (!this.isPartial()) throw new Error('Object of Allergen is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Allergens');

        const result = await col.updateOne({ _id: this._id }, { $set: this });
        if(result.matchedCount < 1) throw new Error('No record for allergen with id: ' + this._id + ' found.');
        return result.modifiedCount == 1;
    }

    static async listAll(limit: number): Promise<RelyonAllergen[]> {
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Allergens');
        var documents = await col.aggregate<RelyonAllergen>().limit(limit);
        if(documents == null) throw Error(`Could not list allergens from Database.`);
        return documents.toArray();
    }

    static fromJson(data: JSON): RelyonAllergen {
        return plainToInstance(RelyonAllergen, data);     
    }
    
}

// ! Groceries Class

export interface RelyonGroceries {
    _id?: ObjectId;
    name: string;
    icon?: string;
    iconURL?: string;
    lowercase: string;
    preDefined: boolean;
    author?: ObjectId;
}

export class RelyonGroceries implements JSONConvertible, DBObject {
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    _id?: ObjectId;
    @Expose() name: string;
    @Expose() icon?: string;
    @Expose()  @Transform(({ value }) => value ? value : undefined)
    iconURL?: string;
    @Expose() lowercase: string;
    @Expose() preDefined: boolean;
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    author?: ObjectId;

    constructor(name: string, lowercase: string, preDefined: boolean, id?: ObjectId){
        this._id = id;
        this.name = name;
        this.lowercase = lowercase;
        this.preDefined = preDefined;
    }

    isPartial(): boolean {
        return (typeof this.name == "string" && typeof this.lowercase == "string"  && typeof this.preDefined == "boolean");
    }

    isComplete(): boolean {
        return (this._id instanceof ObjectId && typeof this.name == "string" && typeof this.lowercase == "string"  && typeof this.preDefined == "boolean" && typeof this.icon == 'string' && typeof this.iconURL == 'string' && this._id instanceof ObjectId);
    }

    static async initByID(id: string): Promise<RelyonGroceries> {
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Groceries');
        var result = await col.findOne<RelyonGroceries>({_id: new ObjectId(id)});
        if(result == null) throw Error(`Could not find such a allergen with provided id.`);
        return result;
    }

    async insertToDatabase(includeIfFound?: boolean): Promise<ObjectId> {
        if (!this.isPartial()) throw new Error('Object of allergen is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Groceries');
        const exists = await col.find({ $or: [ {name: this.name}, {_id: this._id} ] }).toArray();

        if(exists.length > 1 && !includeIfFound) throw new Error('Multiple Groceries found for id: ' + this._id + ', name: ' + this.name + '. Probably mismatched name and id?');
        if(exists.length > 0 && !includeIfFound) throw new Error('Grocery with this name or id already exists');
        if(exists != undefined && exists.length > 0) return exists[0]._id;

        const result = await col.insertOne(this);
        if(result == null) throw Error(`Could not insert Grocery to Database.`);
        return result.insertedId;
    }

    async updateOnDatabase(): Promise<boolean> {
        if (!this.isPartial()) throw new Error('Object of Grocery is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Groceries');

        const result = await col.updateOne({ _id: this._id }, { $set: this });
        if(result.matchedCount < 1) throw new Error('No record for groceries with id: ' + this._id + ' found.');
        return result.modifiedCount == 1;
    }
    

    static async listAll(limit: number): Promise<RelyonGroceries[]> {
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Groceries');
        var documents = await col.aggregate<RelyonGroceries>().limit(limit);
        if(documents == null) throw Error(`Could not list groceries from Database.`);
        return documents.toArray();
    }
    
}

// ! Food Class

export interface RelyonFood {
    _id?: ObjectId;
    name: string;
    icon?: string;
    iconURL?: string;
    lowercase: string;
    preDefined: boolean;
    author?: ObjectId;
}

export class RelyonFood implements JSONConvertible, DBObject {
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    _id?: ObjectId;
    @Expose() name: string;
    @Expose() icon?: string;
    @Expose() @Transform(({ value }) => value ? value : undefined)
    iconURL?: string;
    @Expose() lowercase: string;
    @Expose() preDefined: boolean;
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    author?: ObjectId;

    constructor(name: string, lowercase: string, preDefined: boolean, id?: ObjectId){
        this._id = id;
        this.name = name;
        this.lowercase = lowercase;
        this.preDefined = preDefined;
    }

    isPartial(): boolean {
        return (typeof this.name == "string" && typeof this.lowercase == "string"  && typeof this.preDefined == "boolean");
    }

    isComplete(): boolean {
        return (this._id instanceof ObjectId && typeof this.name == "string" && typeof this.lowercase == "string"  && typeof this.preDefined == "boolean" && typeof this.icon == 'string' && typeof this.iconURL == 'string' && this._id instanceof ObjectId);
    }

    static async initByID(id: string): Promise<RelyonFood> {
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Food');
        var result = await col.findOne<RelyonFood>({_id: new ObjectId(id)});
        if(result == null) throw Error(`Could not find such a allergen with provided id.`);
        return result;
    }

    async insertToDatabase(includeIfFound?: boolean): Promise<ObjectId> {
        if (!this.isPartial()) throw new Error('Object of Food is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Food');
        const exists = await col.find({ $or: [ {name: this.name}, {_id: this._id} ] }).toArray();

        if(exists.length > 1 && !includeIfFound&& !includeIfFound) throw new Error('Multiple Food found for id: ' + this._id + ', name: ' + this.name + '. Probably mismatched name and id?');
        if(exists.length > 0 && !includeIfFound) throw new Error('Food with this name or id already exists');
        if(exists != undefined && exists.length > 0) return exists[0]._id;

        const result = await col.insertOne(this);
        if(result == null) throw Error(`Could not insert Food to Database.`);
        return result.insertedId;
    }

    async updateOnDatabase(): Promise<boolean> {
        if (!this.isPartial()) throw new Error('Object of Food is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Food');

        const result = await col.updateOne({ _id: this._id }, { $set: this });
        if(result.matchedCount < 1) throw new Error('No record for food with id: ' + this._id + ' found.');
        return result.modifiedCount == 1;
    }

    static async listAll(limit: number): Promise<RelyonFood[]> {
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Food');
        var documents = await col.aggregate<RelyonFood>().limit(limit);
        if(documents == null) throw Error(`Could not list allergens from Database.`);
        return documents.toArray();
    }
    
}

// ! Influences Class

export interface RelyonInfluences {
    _id?: ObjectId;
    name: string;
    icon?: string;
    iconURL?: string;
    lowercase: string;
    preDefined: boolean;
    author?: ObjectId;
}

export class RelyonInfluences implements JSONConvertible, DBObject {

    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    _id?: ObjectId;
    @Expose() name: string;
    @Expose() icon?: string;
    @Expose() @Transform(({ value }) => value ? value : undefined)
    iconURL?: string;
    @Expose() lowercase: string;
    @Expose() preDefined: boolean;
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    author?: ObjectId;

    constructor(name: string, lowercase: string, preDefined: boolean, id?: ObjectId){
        this._id = id;
        this.name = name;
        this.lowercase = lowercase;
        this.preDefined = preDefined;
    }

    isPartial(): boolean {
        return (typeof this.name == "string" && typeof this.lowercase == "string"  && typeof this.preDefined == "boolean");
    }

    isComplete(): boolean {
        return (this._id instanceof ObjectId && typeof this.name == "string" && typeof this.lowercase == "string"  && typeof this.preDefined == "boolean" && typeof this.icon == 'string' && typeof this.iconURL == 'string' && this._id instanceof ObjectId);
    }

    static async initByID(id: string): Promise<RelyonInfluences> {
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Influences');
        var result = await col.findOne<RelyonInfluences>({_id: new ObjectId(id)});
        if(result == null) throw Error(`Could not find such a allergen with provided id.`);
        return result;
    }

    async insertToDatabase(includeIfFound?: boolean): Promise<ObjectId> {
        if (!this.isPartial()) throw new Error('Object of Influence is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Influences');
        const exists = await col.find({ $or: [ {name: this.name}, {_id: this._id} ] }).toArray();

        if(exists.length > 1 && !includeIfFound) throw new Error('Multiple Influences found for id: ' + this._id + ', name: ' + this.name + '. Probably mismatched name and id?');
        if(exists.length > 0 && !includeIfFound) throw new Error('Influence with this name or id already exists');
        if(exists != undefined && exists.length > 0) return exists[0]._id;

        const result = await col.insertOne(this);
        if(result == null) throw Error(`Could not insert Influence to Database.`);
        return result.insertedId;
    }

    async updateOnDatabase(): Promise<boolean> {
        if (!this.isPartial()) throw new Error('Object of influence is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Influences');

        const result = await col.updateOne({ _id: this._id }, { $set: this });
        if(result.matchedCount < 1) throw new Error('No record for influences with id: ' + this._id + ' found.');
        return result.modifiedCount == 1;
    }

    static async listAll(limit: number): Promise<RelyonInfluences[]> {
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Influences');
        var documents = await col.aggregate<RelyonInfluences>().limit(limit);
        if(documents == null) throw Error(`Could not list allergens from Database.`);
        return documents.toArray();
    }
    
}


// ! Allergy Class
export interface RelyonAllergy {
    
    _id?: ObjectId;
    name: string;
    relatedQuestions?: Array<ObjectId>;
    allergens?: Array<RelyonAllergen>;
    groceries?: Array<RelyonGroceries>;
    food?: Array<RelyonFood>;
    influences?: Array<RelyonInfluences>;
    preDefined: boolean;
}

export class RelyonAllergy implements JSONConvertible, DBObject {
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    _id?: ObjectId;
    @Expose() 
    name!: string;
    @Expose() @Transform(({ value }) => value ? value.map((_obj: unknown[]) => {return new ObjectId(value)}) : undefined, { toClassOnly: true })
    relatedQuestions?: Array<ObjectId>;
    @Expose() @Transform(({ value }) => value ? value.map((obj: unknown[]) => {return plainToInstance(RelyonAllergen, obj)}) : undefined, { toClassOnly: true })
    allergens?: Array<RelyonAllergen>;
    @Expose() @Transform(({ value }) => value ? value.map((obj: unknown[]) => {return plainToInstance(RelyonGroceries, obj)}) : undefined, { toClassOnly: true })
    groceries?: Array<RelyonGroceries>;
    @Expose() @Transform(({ value }) => value ? value.map((obj: unknown[]) => {return plainToInstance(RelyonFood, obj)}) : undefined, { toClassOnly: true })
    food?: Array<RelyonFood>;
    @Expose() @Transform(({ value }) => value ? value.map((obj: unknown[]) => {return plainToInstance(RelyonInfluences, obj)}) : undefined, { toClassOnly: true })
    influences?: Array<RelyonInfluences>;
    @Expose() preDefined!: boolean;

    isComplete(): boolean {
        return (
            this._id instanceof ObjectId &&
            typeof this.name == "string" && 
            this.relatedQuestions instanceof Array<ObjectId> && 
            this.allergens instanceof Array<RelyonAllergen> &&
            this.groceries instanceof Array<RelyonGroceries> &&
            this.food instanceof Array<RelyonFood>  &&
            this.influences instanceof Array<RelyonInfluences> &&
            typeof this.preDefined == "boolean");
    }

    isPartial(): boolean {
        return (
            typeof this.name == "string" && 
            typeof this.preDefined == "boolean");
    }

    async insertToDatabase(){
        if (!this.isPartial()) throw new Error('Object of Allergy is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Allergies');
        const exists = await col.findOne({ name: this.name});
        if(exists != undefined) throw new Error('Allergy with this name already exists');

        if(this.allergens != undefined){
            for(var allergen of this.allergens) allergen._id = await allergen.insertToDatabase(true);
        }

        if(this.groceries != undefined){
            for(var grocery of this.groceries) grocery._id = await grocery.insertToDatabase(true);
        }
        if(this.food != undefined){
            for(var food of this.food) food._id = await food.insertToDatabase(true);
        }

        if(this.influences != undefined){
            for(var influence of this.influences) influence._id = await influence.insertToDatabase(true);
        }

        const result = await col.insertOne(this);
        if(result == null) throw Error(`Could not insert Allergy to Database.`);
        return result.insertedId;
    }

    async updateOnDatabase(): Promise<boolean> {
        if (!this.isPartial()) throw new Error('Object of Allergy is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Allergies');

        if(this.allergens != undefined){
            for(var allergen of this.allergens) await allergen.updateOnDatabase();
        }

        if(this.groceries != undefined){
            for(var grocery of this.groceries) await grocery.updateOnDatabase();
        }
        if(this.food != undefined){
            for(var food of this.food) await food.updateOnDatabase();
        }

        if(this.influences != undefined){
            for(var influence of this.influences) await influence.updateOnDatabase();
        }

        const result = await col.updateOne({ _id: this._id }, { $set: this });
        if(result.matchedCount < 1) throw new Error('No record for allergy with id: ' + this._id + ' found.');
        return result.modifiedCount == 1;
    }

}

// ! Question Class

export interface RelyonQuestion {
    _id?: ObjectId;
    question: string;
    category: string;
    choiceType: string;
    choice?: RelyonDBChoiceObject<RelyonDBRef<any>[]>
}

export class RelyonQuestion implements JSONConvertible, DBObject {
    @Expose() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    _id?: ObjectId;
    @Expose() 
    question!: string;
    @Expose() 
    category!: string;  
    @Expose() 
    choiceType!: string;
    @Expose() @Transform(({ value }) => new RelyonDBChoiceObject(value.object.map((obj: { ref: string; }) => {
        return new RelyonDBRef(obj.ref, value.choiceQualifier);
    }), value.choiceQualifier), { toClassOnly: true })
    choice?: RelyonDBChoiceObject<RelyonDBRef<any>[]>

    static async initByID(id: string){
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Questions');
        var result = await col.findOne<RelyonQuestion>({_id: new ObjectId(id)});
        if(result == null) throw Error(`Could not find Question with this id on Database.`);
        return plainToInstance(RelyonQuestion, result);
    }

    isComplete(): boolean {
        return (
            this._id instanceof ObjectId &&
            typeof this.question == "string" && 
            typeof this.category == "string" && 
            typeof this.choiceType == "string" && 
            this.choice instanceof RelyonDBChoiceObject<RelyonDBRef<any>[]>);
    }

    isPartial(): boolean {
         return (
            typeof this.question == "string" && 
            typeof this.category == "string" && 
            typeof this.choiceType == "string");
    }

    async getOptions(withRefFilter?: string): Promise<any[]> {
        var objects: any[] = [];
        for(var refObject of this.choice!.object) {
            if(withRefFilter) refObject.refObject?.applyFilters(withRefFilter);
            var object = await refObject.getReferencedObject();
            if(object) objects.push(object);
        }
        return objects;
    }
    
    async getSourceOptions(withRefFilter?: string): Promise<any[] | undefined> {
        if(this.choice === undefined || this.choice.choiceQualifier === undefined) throw Error('Choice qualifier or object is not defined for this object.');
        var dbRef = new RelyonDBRef<any>(this.choice.choiceQualifier);
        if(withRefFilter && dbRef.refObject !== undefined) dbRef.refObject.applyFilters(withRefFilter);
        return await dbRef.getUnderlayingObjects();
    }

    async insertToDatabase(includeIfFound?: boolean | undefined): Promise<ObjectId> {
        if (!this.isPartial()) throw new Error('Object of Question is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Questions');
        const exists = await col.find({ $or: [ {question: this.question}, {_id: this._id} ] }).toArray();

        if(exists.length > 1 && !includeIfFound) throw new Error('Multiple Questions found for id: ' + this._id + ', question: ' + this.question + '. Probably mismatched question and id?');
        if(exists != undefined && exists.length > 0 && !includeIfFound) throw new Error('Question with this question or id already exists');
        if(exists != undefined && exists.length > 0) return exists[0]._id;

        const result = await col.insertOne(this);
        if(result == null) throw Error(`Could not insert Question to Database.`);
        return result.insertedId;
    }

    async updateOnDatabase(): Promise<boolean> {
        if (!this.isPartial()) throw new Error('Object of Question is not complete or correct.');
        const connection = await DBClient.connect();
        const col = connection.db('RelyonAllergyProfile').collection('Questions');

        const result = await col.updateOne({ _id: this._id }, { $set: this });
        if(result.matchedCount < 1) throw new Error('No record for question with id: ' + this._id + ' found.');
        return result.modifiedCount == 1;
    }
    
}