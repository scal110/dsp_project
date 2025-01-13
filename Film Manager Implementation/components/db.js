'use strict'

const sqlite = require('sqlite3').verbose();
const path = require('path');

const DB= path.join(__dirname, '../database/databaseV2.db');
const db= new sqlite.Database(DB, (err)=>{
    if (err){
        // Cannot open Database
        console.error(err.message);
        throw err;
    }
    db.exec('PRAGMA foreign_keys = ON;', function(error){
        if (error){
            console.error("Pragma statment didn't work.")
        }
    })
})


module.exports= db;