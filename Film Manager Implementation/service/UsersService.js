'use strict'


const User = require('../components/user');
const db = require('../components/db');
const bcrypt = require('bcrypt');


exports.getUserByEmail= function (email){
    return new Promise((resolve,reject)=>{
        const sql = "SELECT * FROM users WHERE email=?";
        db.get(sql,[email], (err,row)=>{
            if(err){
                reject(err);
            }
            else if(!row){
                reject(404);
            }
            else{
                resolve(parseUser(row))
            }
        })
    })
}

exports.getUserById = function (id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, name, email FROM users WHERE id = ?"
        db.get(sql, [id], (err, row) => {
            console.log("ciao")
            if (err) 
                reject(err);
            else if (!row)
                reject(404);
            else{
                resolve(parseUser(row));
            }
        });
    });
  };

  exports.getUsers = function() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, name, email FROM users";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else if (!rows.length){
                reject(404);
            }
                else {
                    let users = rows.map((row) => parseUser(row));
                    resolve(users);
                }
            });
      });
  }



const parseUser = function (row) {
    return new User(row.id,row.name,row.email,row.hash);
}


//CHECK PASSOWRD
exports.checkPassword = function(user, password){
    return bcrypt.compareSync(password, user.hash);
  }