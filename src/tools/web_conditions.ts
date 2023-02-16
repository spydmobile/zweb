import { MongoClient } from 'mongodb'
import * as fs from 'fs-extra';
import { Spinner } from 'cli-spinner'
import * as dotenv from 'dotenv' 
dotenv.config()





const client = new MongoClient(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_COLLECTION}`)
const db = client.db()
const sensorRecords = db.collection('sensor_records')
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
export const readCurrentConditions = (): Promise<DBRecordArray> => {
  var spinner1 = new Spinner('currentConditions: %s');
  spinner1.setSpinnerString(10);
  spinner1.start();
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
         console.log("DBRESULT:", result?.length, " Records");
        spinner1.stop();
        if (typeof result != 'undefined') {
          let d = new Date();
        //  d.setHours(d.getHours() - 7)
          let buildDateString = d.toLocaleString()
          let final = { data: result, build: buildDateString }
          let foo: DBRecordArray = JSON.parse(JSON.stringify(final))
          resolve(foo)
        }
        else {
          resolve([])
        }

      });
  });



}
export const readlast24 = (): Promise<any> => {
  var spinner = new Spinner('readlast24: %s');
  spinner.setSpinnerString(0);
  spinner.start();

  return new Promise(async (resolve, reject) => {

    var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime();
    //console.log("yesterday",yesterday)

    // sensorRecords.find({ $where: function () { return Date.now() - Number(this._id.getTimestamp()) < (24 * 60 * 60 * 1000) } }).toArray(function (err, result) {
    //   if (err) reject(err);
    //   //console.log("readlast24", result);
    //   spinner.stop();
    //   resolve(result)
    // });

    
    sensorRecords.find({date: { $gt: yesterday }}).sort({date:1}).toArray(function (err, result) {
      if (err) reject(err);
      if (result !== undefined) console.log("readlast24", result.length, "Records");
      spinner.stop();
      resolve(result)
    });



  })
}
console.log("Connecting to db...");

client.connect()
  .then(() => {
    console.log("Reading DB");
    readCurrentConditions()
      .then((stuff) => {
        //  console.log(stuff);
        // write 
        let data = JSON.stringify(stuff, null, 2);
        fs.writeFileSync('docs/data.json', data);
        return
      })
      .then(()=>{
        readlast24()
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
              process.exit()
            })
        })
      })

    
  })
