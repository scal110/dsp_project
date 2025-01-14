'use strict'

const Film = require("../components/film");
const db = require("../components/db");
const constants= require("../utils/costants.js")



//create film

exports.createFilm = function (film, owner) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO films(title,owner,private,watchDate,rating,favorite) VALUES(?,?,?,?,?,?)';
        db.run(sql, [film.title, owner, film.private, film.watchDate, film.rating, film.favourite], function(err){
            if (err){
                reject(err);
            }
            else{
            var newFilm = new Film(this.lastID, film.title, owner, film.private, film.watchDate, film.rating, film.favourite);
            resolve(newFilm);
            }
        })

    })
}

exports.getPublicFilms = function(req){
    return new Promise((resolve, reject) => {
        const sqlCount = 'SELECT COUNT(*) total FROM films WHERE private=0';
        
        
        db.get(sqlCount, [], (err, size) => {
            if (err) {
                reject(err);
                return;
            }

            const total = Math.ceil(size.total/constants.OFFSET);
            let pageNo = parseInt(req.query.pageNo) || 1;

            // If the selected page is greater than the totalPages the last one is returned
            const limit = getPage(pageNo>total ? total : pageNo);
            let sqlFilms = 'SELECT * FROM films WHERE private=0';

            
            if (limit.length !== 0) {
                sqlFilms = sqlFilms + ' LIMIT ?,?';
            }

            
            db.all(sqlFilms, limit, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                let films = rows.map(row => parseFilm(row));

                
                resolve({ total: total, films: films });
            });
        });
    });
}

exports.getOwnedFilms = function(req){
    return new Promise((resolve, reject) => {
        const sqlCount = 'SELECT COUNT(*) total FROM films WHERE owner= ?';
        
        
        db.get(sqlCount, [req.user.id], (err, size) => {
            if (err) {
                reject(err);
                return;
            }

            const total = Math.ceil(size.total/constants.OFFSET);
            let pageNo = parseInt(req.query.pageNo) || 1;

            // If the selected page is greater than the totalPages the last one is returned
            const limit = getPage((pageNo>total )? total : pageNo);
            let sqlFilms = 'SELECT * FROM films WHERE owner= ?';

            
            if (limit.length !== 0) {
                sqlFilms = sqlFilms + ' LIMIT ?,?';
            }

            
            db.all(sqlFilms, [req.user.id,...limit], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                let films = rows.map(row => parseFilm(row));

                
                resolve({ total: total, films: films });
            });
        });
    });
}

exports.getSinglePublicFilm = function(filmId){

    return new Promise((resolve,reject)=>{
        const sql = "SELECT * FROM films WHERE id=? AND private=?";
        db.get(sql,[filmId,0], ( err,row)=>{
            if (err){
                reject(err);
            }

            else if (!row){
                reject(404);
            }
            else{
                resolve(parseFilm(row));
            }
            
        });
    })



}

exports.getSinglePrivateFilm = function(req){

    return new Promise((resolve,reject)=>{
        const sql = "SELECT * FROM films WHERE id=? AND private=?";
        db.get(sql,[req.params.filmId,1], ( err,row)=>{
            if (err){
                reject(err);
            }

            else if (!row){
                reject(404);
            }
            else if (row.owner !=req.user.id){
                reject(403);
            }
            else{
                resolve(parseFilm(row));
            }
            
        });
    })



}

exports.updateSinglePrivateFilm = function(updatedFilm,filmId,userId){
    return new Promise((resolve,reject)=>{
        const sqlGet ="SELECT owner,private FROM films WHERE id = ? AND private= ?"
        db.get(sqlGet,[filmId,1],(err,row)=>{
            if (err){
                
                reject(err);
            }
            else if(!row){
                reject(404);
            }
            else if (row.owner!= userId){
                reject(403);
            }
            else if (row.private!=updatedFilm.private){
                reject(409);
            }
            else{
                var params=[updatedFilm.title];
                var sqlUpdate = 'UPDATE films SET title= ?';
                if (updatedFilm.watchDate !=undefined){
                    sqlUpdate=sqlUpdate.concat(", watchDate = ?");
                    params.push(updatedFilm.watchDate);
                }
                if (updatedFilm.rating !=undefined){
                    sqlUpdate=sqlUpdate.concat(", rating = ?");
                    params.push(updatedFilm.rating);
                }
                if (updatedFilm.favorite !=undefined){
                    sqlUpdate=sqlUpdate.concat(", favorite = ?");
                    params.push(updatedFilm.favorite);
                }
                sqlUpdate=sqlUpdate.concat(" WHERE id = ?");
                params.push(filmId);
                console.log(params);
                console.log(sqlUpdate);



                db.run(sqlUpdate,params,(err)=>{
                    if (err){
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                })

            }
        })
    })
}

exports.deleteSinglePrivateFilm = function (filmId,userId){
    return new Promise((resolve,reject)=>{
        const sqlGet = "SELECT owner FROM films WHERE id = ? AND private = ?";
        db.get(sqlGet,[filmId,1], (err,row)=>{
            if(err){
                reject(err);
            }
            else if (!row){
                reject(404);
            }
            else if (row.owner!=userId){
                reject(403);
            }
            else{
                const sqlDelete= "DELETE FROM films WHERE id = ?";
                db.run(sqlDelete,filmId,(err)=>{
                    if (err){
                        reject(err);
                    }
                    else{
                        resolve();
                    }
                })
            }
        })
    })
}

exports.getPrivateFilms = function(req){
        return new Promise((resolve, reject) => {
            const sqlCount = 'SELECT COUNT(*) total FROM films WHERE private=1 AND owner=?';
            
            
            db.get(sqlCount, [req.user.id], (err, size) => {
                if (err) {
                    reject(err);
                    return;
                }
    
                const total = Math.ceil(size.total/constants.OFFSET);
                var pageNo = parseInt(req.query.pageNo) || 1;
    
                // If the selected page is greater than the totalPages the last one is returned
                const limit = getPage((pageNo>total) ? total : pageNo);
                let sqlFilms = 'SELECT * FROM films WHERE private=1 AND owner=?';
    
                
                if (limit.length !== 0) {
                    sqlFilms = sqlFilms + ' LIMIT ?,?';
                }
    
                
                db.all(sqlFilms, [req.user.id,...limit], (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
    
                    let films = rows.map(row => parseFilm(row));
    
                    
                    resolve({ total: total, films: films });
                });
            });
        });
}

exports.updateSinglePublicFilm = function(updatedFilm,filmId,userId){
    return new Promise((resolve,reject)=>{
        const sqlGet ="SELECT owner,private FROM films WHERE id = ? AND private= ?"
        db.get(sqlGet,[filmId,0],(err,row)=>{
            if (err){
                
                reject(err);
            }
            else if(!row){
                reject(404);
            }
            else if (row.owner!= userId){
                reject(403);
            }
            else if (row.private!=updatedFilm.private){
                reject(409);
            }
            else{
                var sqlUpdate = 'UPDATE films SET title= ? WHERE id = ?';

                db.run(sqlUpdate,[updatedFilm.title,filmId],(err)=>{
                    if (err){
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                })

            }
        })
    })
}

exports.deleteSinglePublicFilm = function (filmId,userId){
    return new Promise((resolve,reject)=>{
        const sqlGet = "SELECT owner FROM films WHERE id = ? AND private = ?";
        db.get(sqlGet,[filmId,0], (err,row)=>{
            if(err){
                reject(err);
            }
            else if (!row){
                reject(404);
            }
            else if (row.owner!=userId){
                reject(403);
            }
            else{
                const sqlDelete= "DELETE FROM films WHERE id = ?";
                db.run(sqlDelete,filmId,(err)=>{
                    if (err){
                        reject(err);
                    }
                    else{
                        resolve();
                    }
                })
            }
        })
    })
}

exports.getInvited = function (req) {
    return new Promise((resolve, reject) => {

        const sqlCount = "SELECT COUNT(*) total FROM reviews WHERE reviewerId = ?";

        db.get(sqlCount, [req.user.id], (err, size) => {
            if (err) {
                reject(err);
                return;
            }

            const total = Math.ceil(size.total/constants.OFFSET);
            let pageNo = parseInt(req.query.pageNo) || 1;

            // If the selected page is greater than the totalPages the last one is returned
            const limit = getPage((pageNo > total) ? size.total : pageNo);


            let sqlGet = "SELECT * FROM films WHERE id IN (SELECT filmId FROM reviews WHERE reviewerId= ?)";
            if (limit.length !== 0) {
                sqlGet = sqlGet + ' LIMIT ?,?';
            }


            db.all(sqlGet, [req.user.id, ...limit], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else if (!rows) {
                    reject(404);
                }
                else {
                    let invited = rows.map(row => parseFilm(row));
                    resolve({total:total,films:invited})
                }
            })
        })
    })
}
















const getPage = (pageNo) => {
    let page = (pageNo>0) ? pageNo : 1;

    var pageSize = parseInt(constants.OFFSET);
    var limit=[];
    limit.push(pageSize * (page -1) );
    limit.push(pageSize);
    return limit;
}

const parseFilm = (row)=>{
    var favourite = row.favourite || 0
    return new Film(row.id,row.title,row.owner,Boolean(row.private),row.watchDate,row.rating, Boolean(favourite))


}