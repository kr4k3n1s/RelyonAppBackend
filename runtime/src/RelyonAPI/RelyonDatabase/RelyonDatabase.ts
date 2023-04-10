
// ! Other Classes

import { Expose, Exclude, Transform } from "class-transformer";
import { ObjectId } from "mongodb";
import { DBClient } from "../RelyonAPI";

export class RelyonDBChoiceObject<T = unknown> {
    @Expose() choiceQualifier?: string;
    @Expose() referenceBase: string;
    @Expose() object: T;

    constructor(object: T, referenceBase: string, choiceQualifier?: string){
        this.referenceBase = referenceBase;
        this.choiceQualifier = choiceQualifier;
        this.object = object;
    }
}

export interface RelyonReferenceObject {
    database: string;
    collection: string;
    query: {fieldName: string; operand: {fieldValue: any; operation?: string;}[] }[];
    choiceSpecific?: boolean;
}

export class RelyonReferenceObject {

    constructor(database: string, collection: string, query?: {fieldName: string; operand: {fieldValue: any; operation?: string;}[] }[], choiceSpecific = true){
        this.database = database;
        this.collection = collection;
        this.query = query!;
        this.choiceSpecific = choiceSpecific;
    }

    static parseReference(reference: string, qualifier = ''): RelyonReferenceObject | undefined {
        var queryIdentificators = reference.match(/([^\/]+)\/([^\/]+)(?:\/(.+))?/);
        var qualifierIdentificators = qualifier.match(/([^\/]+)\/([^\/]+)(?:\/(.+))?/);

        if(queryIdentificators === null && qualifierIdentificators === null) throw new Error('Query is incomplete or not valid!');
        if(qualifier && queryIdentificators && queryIdentificators.length < 2) throw new Error('Query is incomplete or not valid!');
        if(reference.split('/').length === 2 && queryIdentificators) return new RelyonReferenceObject(queryIdentificators[1], queryIdentificators[2], [], false);
      
        var db = qualifierIdentificators !== null ? qualifierIdentificators[1] : queryIdentificators![1];
        var collection = qualifierIdentificators !== null ? qualifierIdentificators[2] : queryIdentificators![2];
      
        var queryStatements = qualifierIdentificators !== null 
                            ? queryIdentificators === null ? reference.match(/[^,]+(?=,|$)/g) : queryIdentificators![3].match(/[^,]+(?=,|$)/g)
                            : queryIdentificators![3].match(/[^,]+(?=,|$)/g);
        if(queryStatements === null) throw new Error('Cannot parse this query');

        var query:{fieldName: string; operand: {fieldValue: any; operation?: string;}[] }[] = new Array<{fieldName: string; operand: {fieldValue: any; operation?: string;}[] }>();
        for(var statement of queryStatements){
            var fieldName = statement.match(/^(\w+):(?:)?/)?.[1];
            if(fieldName === null || fieldName === undefined) continue;
      
            if(/([^[]+(?=]))/.test(statement)) { // AND
                var andStatement = statement.match(/([^[]+(?=]))/g)?.[0];
                if(andStatement === undefined || andStatement.length < 1) continue;
                var andPieces = andStatement.match(/[^;]+(?=;|$)/g);
                if(andPieces === undefined || andPieces === null) continue;
                
                var operands: {fieldValue: any; operation?: string;}[] = new Array<{fieldValue: any; operation?: string;}>();
                for(var piece of andPieces){
                    var pieceParticles = piece.split(':');
                    var operation = pieceParticles[0] === '' ? '$eq' : pieceParticles[0];
                    var value = RelyonReferenceObject.convertToSupportedValue(fieldName, operation, pieceParticles[1]);
                    operands.push({operation: operation, fieldValue: value});
                }
                query.push({fieldName: fieldName, operand: operands});
            } else {
                var pieceParticles = statement.split(':');
                var operation = pieceParticles[1] === '' ? '$eq' : pieceParticles[1];
                var value = RelyonReferenceObject.convertToSupportedValue(fieldName, operation, pieceParticles[2]);
                query.push({fieldName: fieldName, operand: [{operation: operation, fieldValue: value}]})
            }
        }
        return new RelyonReferenceObject(db, collection, query);
    }

    static convertToSupportedValue(field:string, oper: string, value: any): any {
        if(oper === '$not') {
            return new RegExp(value);
        } else if(field === '_id') {
            return new ObjectId(value);
        } else {
            return JSON.parse(value);
        }
    }

    static parseUnderlayingReference(reference: string): RelyonReferenceObject{
        var db = reference.split('/')[0];
        var collection = reference.split('/')[1];
        return new RelyonReferenceObject(db, collection, []);
    }

    applyFilters(filters: string){
        var queryStatements = filters.match(/[^,]+(?=,|$)/g);
        if(queryStatements === null) throw new Error('Cannot parse this query');
        var query:{fieldName: string; operand: {fieldValue: any; operation?: string;}[] }[] = new Array<{fieldName: string; operand: {fieldValue: any; operation?: string;}[] }>();
        for(var statement of queryStatements){
            var fieldName = statement.match(/^(\w+):(?:)?/)?.[1];
            if(fieldName === null || fieldName === undefined) continue;
            if(/([^[]+(?=]))/.test(statement)) { // AND
                var andStatement = statement.match(/([^[]+(?=]))/g)?.[0];
                if(andStatement === undefined || andStatement.length < 1) continue;
                var andPieces = andStatement.match(/[^;]+(?=;|$)/g);
                if(andPieces === undefined || andPieces === null) continue;
                
                var operands: {fieldValue: any; operation?: string;}[] = new Array<{fieldValue: any; operation?: string;}>();
                for(var piece of andPieces){
                    var pieceParticles = piece.split(':');
                    var operation = pieceParticles[0] === '' ? '$eq' : pieceParticles[0];
                    var value = RelyonReferenceObject.convertToSupportedValue(fieldName, operation, pieceParticles[1]);
                    operands.push({operation: operation, fieldValue: value});
                }
                query.push({fieldName: fieldName, operand: operands});
            } else {
                var pieceParticles = statement.split(':');
                var operation = pieceParticles[1] === '' ? '$eq' : pieceParticles[1];
                var value = RelyonReferenceObject.convertToSupportedValue(fieldName, operation, pieceParticles[2]);
                query.push({fieldName: fieldName, operand: [{operation: operation, fieldValue: value}]})
            }
        }
        console.log('FITLER: ' + JSON.stringify(query));
        this.query = [...this.query, ...query];
    }

    mongoQuery(): any {
        if(this.query.length < 1 && this.choiceSpecific) throw new Error('Query for choice specific reference is empty.');
        var query = this.query[0];
        const mongoQuery: any = {};

        for(var query of this.query){
            mongoQuery[query.fieldName] = {};
            query.operand.forEach((operand) => {
                mongoQuery[query.fieldName][operand.operation!] = operand.fieldValue;
                if(operand.fieldValue instanceof RegExp) { console.log(operand.fieldValue.toString())}
            });
        }
        console.log('Query: ' + JSON.stringify(mongoQuery));
        return mongoQuery;
    }

}

export interface RelyonNominalDBObject {
    name: string;
    lowercase: string;
    icon?: string;
    iconURL?: string;
    attributes?: any[];
}

export class RelyonNominalDBObject {
    @Expose()
    name!: string;
    @Expose()
    lowercase!: string;
    @Expose() @Transform(({ value }) => value ? value : undefined, { toClassOnly: true })
    icon?: string;
    @Expose() @Transform(({ value }) => value ? value : undefined, { toClassOnly: true })
    iconURL?: string;
    @Transform(({ value }) => value ? value.map((obj: unknown[]) => {return obj;}) : undefined, { toClassOnly: true })
    attributes?: any[];
}

export interface RelyonDBRef<T> {
    _id?: string;
    // value?: any;
    ref: string;
    // nominalObject?: RelyonNominalDBObject;
    refObject?: RelyonReferenceObject;
    refQualifier?: string;
    value?: any;
    lowercase?: string;
}
  
export class RelyonDBRef<T> {

    @Expose() ref: string; // DBNAME/COLLECTION/lowercase:[$not:/^in/;$regex:"pea"];
    @Exclude({toPlainOnly: true}) refQualifier?: string;
    @Exclude({toPlainOnly: true}) refObject?: RelyonReferenceObject;
    // @Exclude({toPlainOnly: true})
    // nominalObject?: RelyonNominalDBObject;
    value?: any;
    lowercase?: string;

    // @Expose({name: 'choice', toClassOnly: true})
    // nominalToChoice(){
    //     this._id = this.nominalObject.
    // }

    constructor(ref: string, refQualifier?: string, _id?: string, value?: string) {
        this.value = value;
        this.lowercase = value?.toLowerCase();
        this.ref = ref;
        this.refQualifier = refQualifier;
        this.refObject = RelyonReferenceObject.parseReference(ref, refQualifier);
    }

    requireSpecificReference(){
        if(this.refObject) this.refObject.choiceSpecific = true;
    }

    async getUnderlayingObjects(withRefFilter?: string): Promise<T[] | T | undefined>  {
        const connection = await DBClient.connect();
        if(this.refObject == undefined) throw Error('Reference object is not parsed from reference');
        if(withRefFilter && this.refObject !== undefined) this.refObject.applyFilters(withRefFilter);
        const col = connection.db(this.refObject?.database).collection(this.refObject?.collection);
        const result = col.find(this.refObject?.mongoQuery());
        if(!(await result.hasNext())) return undefined;
        var docs = await result.toArray();
        return docs.filter(val => val !== undefined).map( obj => obj as T);
    }

    async getReferencedObject(withRefFilter?: string): Promise<T[] | T | undefined> {
        const connection = await DBClient.connect();
        if(this.refObject == undefined) throw Error('Reference object is not parsed from reference');
        if(withRefFilter && this.refObject !== undefined) this.refObject.applyFilters(withRefFilter);
        const col = connection.db(this.refObject?.database).collection(this.refObject?.collection);

        const result = col.find(this.refObject?.mongoQuery());
        if(!(await result.hasNext())) return undefined;
        var docs = await result.toArray();
        return docs.filter(val => val !== undefined).map( obj => obj as T);
    }

}

// for OR ([^{]+(?=}))
// for AND ([^[]+(?=]))
// objects ([^\/]\S[^\/]+(?=\/|$))
// queryPieces ([^,]+(?=,|$))