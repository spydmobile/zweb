/**
 * This will provide DB functions.
 * To start it will be a RAM only DB
 */

import config from 'config'
import { MongoClient } from 'mongodb'
const client = new MongoClient(config.get('mongodb.uri'))
const db = client.db()
const sensorRecords = db.collection('sensor_records')
// const record = {
//     type: "ThisAndThat",
//     lastUpdated: new Date().getTime()
// }
// const query = { type: "ThisAndThat" }
// const options = { upsert: true }
//const result = await sensorRecords.replaceOne(query, record, options)

var mongod, uri

const database = {}
interface Database {
  uuid: string;
  date: Date;
  nid: number;
  Name: string;
  Light: number;
  Battery: number;
  TempC: number;
  RH: number;
  Notes?: string | number;
  season: string;
}
export interface DBRecord {
  uuid: string;
  date: number;
  nid: number;
  Name: string;
  Motion: number;
  Light: number;
  Battery: number;
  TempC: number;
  RH: number;
  Notes: string | number;
}

export interface DBRecordArray extends Array<DBRecord> { }


export const saveRecord = async (record: DBRecord) => {
  sensorRecords.insertOne(record, function (err:any, res:any) {
    if (err) throw err;
    console.log("1 document inserted");
    //   db.close();
  });
}

export const readRecord = (nid: number) => {
  sensorRecords.find({ nid: nid }, { projection: { _id: 0, } }).toArray(function (err, result) {
    if (err) throw err;
    // console.log(result);
    return result
  });
}

export const readlast24 = ():Promise<any> => {
  return new Promise(async (resolve, reject) => {
    sensorRecords.find({ $where: function () { return Date.now() - Number(this._id.getTimestamp()) < (24 * 60 * 60 * 1000) } }).toArray(function (err, result) {
      if (err) reject(err);
      //console.log("readlast24", result);
      resolve(result)
    });
  })
}




export const readCurrentConditions = (): Promise<DBRecordArray> => {
  return new Promise(async (resolve, reject) => {
    let myQuery =  /** {
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
      ] /** ,
      "maxTimeMS": 0,
      "cursor": {}
    }*/
    // let pipeline = [myQuery]
    let result: any = await sensorRecords.aggregate(myQuery)
      .toArray(function (err, result) {
        if (err) reject(err);
        // console.log("DBRESULT:", result);
        if (typeof result != 'undefined') {
          let foo:DBRecordArray = JSON.parse(JSON.stringify(result))
          resolve(foo)
        }
        else {
          resolve([])
        }

      });
  });



}


export const readHistory = () => {
  return new Promise(async (resolve, reject) => {
    let myQuery =  /** {
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
      ] /** ,
      "maxTimeMS": 0,
      "cursor": {}
    }*/
    // let pipeline = [myQuery]
    let result = await sensorRecords.aggregate(myQuery).toArray(function (err, result) {
      if (err) reject(err);
      // console.log("DBRESULT:", result);
      resolve(result)
    });
  });



}

export const read24hStats = () => {
  return new Promise(async (resolve, reject) => {
    let myQuery =  /** {
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
      ] /** ,
      "maxTimeMS": 0,
      "cursor": {}
    }*/
    // let pipeline = [myQuery]
    let result = await sensorRecords.aggregate(myQuery).toArray(function (err, result) {
      if (err) reject(err);
      // console.log("DBRESULT:", result);
      //  console.log("read24hStats", result);
      resolve(result)
    });
  });



}


export const startDb = async () => {
  // This will create an new instance of "MongoMemoryServer" and automatically start it

  await client.connect()


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
  return
}
export const stopDb = async () => {
  // This will create an new instance of "MongoMemoryServer" and automatically start it

  await client.close()


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
  return
}