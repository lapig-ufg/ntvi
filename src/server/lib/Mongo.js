const { MongoClient } = require("mongodb");

const uri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/?poolSize=20&writeConcern=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export const mongo = client;