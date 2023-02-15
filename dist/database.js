"use strict";
/**
 * This will provide DB functions.
 * To start it will be a RAM only DB
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopDb = exports.startDb = exports.read24hStats = exports.readHistory = exports.readCurrentConditions = exports.readlast24 = exports.readRecord = exports.saveRecord = void 0;
const config_1 = __importDefault(require("config"));
const mongodb_1 = require("mongodb");
const client = new mongodb_1.MongoClient(config_1.default.get('mongodb.uri'));
const db = client.db();
const sensorRecords = db.collection('sensor_records');
// const record = {
//     type: "ThisAndThat",
//     lastUpdated: new Date().getTime()
// }
// const query = { type: "ThisAndThat" }
// const options = { upsert: true }
//const result = await sensorRecords.replaceOne(query, record, options)
var mongod, uri;
const database = {};
const saveRecord = (record) => __awaiter(void 0, void 0, void 0, function* () {
    sensorRecords.insertOne(record, function (err, res) {
        if (err)
            throw err;
        console.log("1 document inserted");
        //   db.close();
    });
});
exports.saveRecord = saveRecord;
const readRecord = (nid) => {
    sensorRecords.find({ nid: nid }, { projection: { _id: 0, } }).toArray(function (err, result) {
        if (err)
            throw err;
        // console.log(result);
        return result;
    });
};
exports.readRecord = readRecord;
const readlast24 = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        sensorRecords.find({ $where: function () { return Date.now() - Number(this._id.getTimestamp()) < (24 * 60 * 60 * 1000); } }).toArray(function (err, result) {
            if (err)
                reject(err);
            //console.log("readlast24", result);
            resolve(result);
        });
    }));
};
exports.readlast24 = readlast24;
const readCurrentConditions = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let myQuery = /** {
          "aggregate": "testcoll",
          "pipeline": */ [
            {
                "$group": {
                    "_id": "$nid",
                    "latestDate": {
                        "$max": {
                            "$mergeObjects": [
                                {
                                    "date": "$date"
                                },
                                "$$ROOT"
                            ]
                        }
                    }
                }
            },
            {
                "$addFields": {
                    "nid": "$_id"
                }
            },
            {
                "$project": {
                    "_id": 0
                }
            },
            {
                "$unwind": {
                    "path": "$latestDate"
                }
            },
            {
                "$replaceRoot": {
                    "newRoot": "$latestDate"
                }
            }
        ]; /** ,
        "maxTimeMS": 0,
        "cursor": {}
      }*/
        // let pipeline = [myQuery]
        let result = yield sensorRecords.aggregate(myQuery)
            .toArray(function (err, result) {
            if (err)
                reject(err);
            // console.log("DBRESULT:", result);
            if (typeof result != 'undefined') {
                let foo = JSON.parse(JSON.stringify(result));
                resolve(foo);
            }
            else {
                resolve([]);
            }
        });
    }));
};
exports.readCurrentConditions = readCurrentConditions;
const readHistory = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let myQuery = /** {
          "aggregate": "testcoll",
          "pipeline": */ [
            {
                "$group": {
                    "_id": "$nid",
                    "latestDate": {
                        "$max": {
                            "$mergeObjects": [
                                {
                                    "date": "$date"
                                },
                                "$$ROOT"
                            ]
                        }
                    }
                }
            },
            {
                "$addFields": {
                    "nid": "$_id"
                }
            },
            {
                "$project": {
                    "_id": 0
                }
            },
            {
                "$unwind": {
                    "path": "$latestDate"
                }
            },
            {
                "$replaceRoot": {
                    "newRoot": "$latestDate"
                }
            }
        ]; /** ,
        "maxTimeMS": 0,
        "cursor": {}
      }*/
        // let pipeline = [myQuery]
        let result = yield sensorRecords.aggregate(myQuery).toArray(function (err, result) {
            if (err)
                reject(err);
            // console.log("DBRESULT:", result);
            resolve(result);
        });
    }));
};
exports.readHistory = readHistory;
const read24hStats = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let myQuery = /** {
          "aggregate": "testcoll",
          "pipeline": */ [
            { '$match': { 'date': { $gte: new Date().getTime() - (24 * 60 * 60 * 1000) } } },
            {
                "$group": {
                    "_id": "$nid",
                    "nid": { "$first": "$nid" },
                    "count": { "$sum": 1 },
                    "MaxTemp": { $max: "$TempC" },
                    "MinTemp": { $min: "$TempC" },
                    "MaxRH": { $max: "$RH" },
                    "MinRH": { $min: "$RH" }
                }
            }
        ]; /** ,
        "maxTimeMS": 0,
        "cursor": {}
      }*/
        // let pipeline = [myQuery]
        let result = yield sensorRecords.aggregate(myQuery).toArray(function (err, result) {
            if (err)
                reject(err);
            // console.log("DBRESULT:", result);
            //  console.log("read24hStats", result);
            resolve(result);
        });
    }));
};
exports.read24hStats = read24hStats;
const startDb = () => __awaiter(void 0, void 0, void 0, function* () {
    // This will create an new instance of "MongoMemoryServer" and automatically start it
    yield client.connect();
    // mongod = await MongoMemoryServer.create()
    //     .then(async (mongo) => {
    //         uri = await mongo.getUri();
    //         console.log("uri:", uri);
    //         return mongo
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     })
    // The Server can be stopped again with
    //await mongod.stop();
    return;
});
exports.startDb = startDb;
const stopDb = () => __awaiter(void 0, void 0, void 0, function* () {
    // This will create an new instance of "MongoMemoryServer" and automatically start it
    yield client.close();
    // mongod = await MongoMemoryServer.create()
    //     .then(async (mongo) => {
    //         uri = await mongo.getUri();
    //         console.log("uri:", uri);
    //         return mongo
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     })
    // The Server can be stopped again with
    //await mongod.stop();
    return;
});
exports.stopDb = stopDb;
