import { ObjectId } from "mongodb";

export interface JSONConvertible {
    isComplete(): boolean;
    isPartial(): boolean;
}

export interface DBObject {
    _id?: ObjectId;
    insertToDatabase(includeIfFound?: boolean): Promise<ObjectId>;
}