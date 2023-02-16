"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readlast24 = exports.readCurrentConditions = void 0;
const mongodb_1 = require("mongodb");
const fs = __importStar(require("fs-extra"));
const cli_spinner_1 = require("cli-spinner");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const client = new mongodb_1.MongoClient(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_COLLECTION}`);
const db = client.db();
const sensorRecords = db.collection('sensor_records');
const readCurrentConditions = () => {
    var spinner1 = new cli_spinner_1.Spinner('currentConditions: %s');
    spinner1.setSpinnerString(10);
    spinner1.start();
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
            console.log("DBRESULT:", result === null || result === void 0 ? void 0 : result.length, " Records");
            spinner1.stop();
            if (typeof result != 'undefined') {
                let d = new Date();
                //  d.setHours(d.getHours() - 7)
                let buildDateString = d.toLocaleString();
                let final = { data: result, build: buildDateString };
                let foo = JSON.parse(JSON.stringify(final));
                resolve(foo);
            }
            else {
                resolve([]);
            }
        });
    }));
};
exports.readCurrentConditions = readCurrentConditions;
const readlast24 = () => {
    var spinner = new cli_spinner_1.Spinner('readlast24: %s');
    spinner.setSpinnerString(0);
    spinner.start();
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime();
        //console.log("yesterday",yesterday)
        // sensorRecords.find({ $where: function () { return Date.now() - Number(this._id.getTimestamp()) < (24 * 60 * 60 * 1000) } }).toArray(function (err, result) {
        //   if (err) reject(err);
        //   //console.log("readlast24", result);
        //   spinner.stop();
        //   resolve(result)
        // });
        sensorRecords.find({ date: { $gt: yesterday } }).sort({ date: 1 }).toArray(function (err, result) {
            if (err)
                reject(err);
            if (result !== undefined)
                console.log("readlast24", result.length, "Records");
            spinner.stop();
            resolve(result);
        });
    }));
};
exports.readlast24 = readlast24;
console.log("Connecting to db...");
client.connect()
    .then(() => {
    console.log("Reading DB");
    (0, exports.readCurrentConditions)()
        .then((stuff) => {
        //  console.log(stuff);
        // write 
        let data = JSON.stringify(stuff, null, 2);
        fs.writeFileSync('docs/data.json', data);
        return;
    })
        .then(() => {
        (0, exports.readlast24)()
            .then((data24) => {
            // console.log(data24);
            // write 
            let data = JSON.stringify(data24, null, 2);
            fs.writeFileSync('docs/data24.json', data);
        })
            .then(() => {
            console.log("Closeing DB");
            client.close()
                .then(() => {
                console.log("Exiting...");
                process.exit();
            });
        });
    });
});
