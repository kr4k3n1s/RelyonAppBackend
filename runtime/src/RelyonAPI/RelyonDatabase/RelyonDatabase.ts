
// ! Other Classes

import { Expose, Exclude, Transform } from "class-transformer";
import { ObjectId } from "mongodb";
import { DBClient } from "../RelyonAPI";

export class RelyonDBChoiceObject<T = unknown> {
    @Expose() choiceQualifier?: string;
    @Expose() object: T;

    constructor(object: T, choiceQualifier?: string){
        this.choiceQualifier = choiceQualifier;
        this.object = object;
    }
}

export interface RelyonReferenceObject {
    database: string;
    collection: string;
    query: {fieldName: string; fieldValue: any; operation?: string;}[];
    choiceSpecific?: boolean;
}

export class RelyonReferenceObject {

    constructor(database: string, collection: string, query: {fieldName: string; fieldValue: any; operation?: string;}[], choiceSpecific = true){
        this.database = database;
        this.collection = collection;
        this.query = query;
        this.choiceSpecific = choiceSpecific;
    }

    static parseReference(reference: string, qualifier?: string): RelyonReferenceObject{
        if(reference.split('/').length === 2) return new RelyonReferenceObject(reference.split('/')[0], reference.split('/')[1], [], false);
        var db = qualifier ? qualifier.split('/')[0] : reference.split('/')[0];
        var collection = qualifier ? qualifier.split('/')[1] : reference.split('/')[1];

        var queryObjects = ((reference.split('/').length == 1 && qualifier) ? reference : reference.split('/')[2]).split(',');
        var query:{fieldName: string; fieldValue: any; operation?: string;}[] = new Array<{fieldName: string; fieldValue: any; operation?: string;}>();
        for(var queryStr of queryObjects){
            var queryPieces = queryStr.split(':');
            if(queryPieces.length < 3) continue;
            query.push({fieldName: queryPieces[0], fieldValue: (queryPieces[0] === '_id') ? new ObjectId(queryPieces[2]) : JSON.parse(queryPieces[2]), operation: queryPieces[1]});
        }
        
        return new RelyonReferenceObject(db, collection, query)
    }

    static parseUnderlayingReference(reference: string): RelyonReferenceObject{
        var db = reference.split('/')[0];
        var collection = reference.split('/')[1];
        return new RelyonReferenceObject(db, collection, []);
    }

    applyFilters(filters: string){
        var queryObjects = filters.split(',');
        var query:{fieldName: string; fieldValue: any; operation?: string;}[] = new Array<{fieldName: string; fieldValue: any; operation?: string;}>();
        for(var queryStr of queryObjects){
            var queryPieces = queryStr.split(':');
            if(queryPieces.length < 3) continue;
            query.push({fieldName: queryPieces[0], fieldValue: (queryPieces[0] === '_id') ? new ObjectId(queryPieces[2]) : JSON.parse(queryPieces[2]), operation: queryPieces[1]});
        }
        this.query = [...this.query, ...query];
    }


    mongoQuery(): any {
        if(this.query.length < 1 && this.choiceSpecific) throw new Error('Query for choice specific reference is empty.');
        var filterContainer: any = {};
        for(var queryObject of this.query){
            if(queryObject.operation) {
                var filterValue: any = {};
                filterValue[queryObject.operation] = queryObject.fieldValue;
                filterContainer[queryObject.fieldName] = filterValue;
            } else {
                filterContainer[queryObject.fieldName] = queryObject.fieldValue;
            }
            
        }
        return filterContainer;
    }

}

export interface RelyonDBRef<T> {
    _id?: string;
    value?: any;
    ref: string;
    refObject?: RelyonReferenceObject;
    refQualifier?: string;
    user?: ObjectId;
}
  
export class RelyonDBRef<T> {

    // @Expose() _id?: string;
    // value?: any;
    @Expose() ref: string; // DBNAME/COLLECTION/F_FIELDNAME:$regex:VALUE,ID_IDFIELD::VALUE
    @Expose() refQualifier?: string;
    @Exclude() refObject?: RelyonReferenceObject;
    // @Exclude() @Transform(({ value }) => value ? new ObjectId(value) : undefined, { toClassOnly: true })
    // user?: ObjectId;

    constructor(ref: string, refQualifier?: string, _id?: string, value?: any, user?: ObjectId) {
        // this._id = _id;
        // this.value = value;
        this.ref = ref;
        // this.user = user;
        this.refQualifier = refQualifier;
        this.refObject = RelyonReferenceObject.parseReference(ref, refQualifier);
    }

    requireSpecificReference(){
        if(this.refObject)
            this.refObject.choiceSpecific = true;
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