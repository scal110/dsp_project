'use strict'

const Review = require('../components/review');
const db = require('../components/db');
const constants = require('../utils/costants')


exports.getFilmReviews = function (req) {
    return new Promise((resolve, reject) => {
        const sqlCount = 'SELECT COUNT(*) total FROM reviews  WHERE filmId= ?';
        let filmId = req.params.filmId

        db.get(sqlCount, [filmId], (err, size) => {
            if (err) {
                reject(err);
                return;
            }

            const total = Math.ceil(size.total/constants.OFFSET);
            let pageNo = parseInt(req.query.pageNo) || 1;

            // If the selected page is greater than the totalPages the last one is returned
            const limit = getPage((pageNo > total) ? total : pageNo);

            let sqlGet = 'SELECT f.owner as owner,r.filmId,r.reviewerid,r.completed,r.reviewDate,r.rating,r.review FROM films f,reviews r WHERE f.id=r.filmId AND r.filmId = ?';

            if (limit.length !== 0) {
                sqlGet = sqlGet + ' LIMIT ?,?';
            }


            db.all(sqlGet, [filmId, ...limit], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                let reviews = rows.map(row => parseReview(row,req.user));

                resolve({ total: total, reviews: reviews });
            });



        });
    });
}

exports.getSingleReview = function (req) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT f.owner as owner,r.filmId,r.reviewerid,r.completed,r.reviewDate,r.rating,r.review FROM films f,reviews r WHERE f.id=r.filmId AND r.filmId= ? AND reviewerId = ?";
        db.get(sql, [req.params.filmId, req.params.reviewerId], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(404);
            }
            else if(!row.completed){
                if(req.user && req.user.id!== row.owner && req.user.id !==row.reviewerId){
                    reject(404);
                }
                else{
                    resolve(parseReview(row,req.user));
                }
            }
            else {
                resolve(parseReview(row,req.user));
            }
        })
    })
}



exports.completeSingleReview = function (req){
    return new Promise((resolve,reject)=>{
        const sqlGet = "SELECT reviewerId, completed FROM reviews WHERE filmId = ? AND reviewerId= ? ";
        let review = req.body;
        db.get(sqlGet,[req.params.filmId,req.params.reviewerId],(err,row)=>{
            if(err){
                reject(err);
            }
            else if(!row){
                reject(404);
            }
            else if (row.reviewerId!=req.user.id) {
                reject(403);

            }
            else if (row.completed){
                reject(409);
            }
            else{
                
                const sqlUpdate = "UPDATE reviews SET completed = ?, reviewDate = ?, rating = ?, review=? WHERE filmId= ? AND reviewerId = ? ";

                db.run(sqlUpdate,[review.completed,review.reviewDate,review.rating,review.review,req.params.filmId,req.params.reviewerId], err=>{
                    if(err){
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


exports.deleteReviewInvitation= function (filmId,userId,reviewerId){
    return new Promise((resolve,reject)=>{
        const sqlGet = "SELECT f.owner,r.completed FROM films f,reviews r WHERE f.id=r.filmId AND f.id = ? AND r.reviewerId= ?";
        db.get(sqlGet,[filmId,reviewerId], (err,row)=>{
            if(err){
                reject(err);
            }
            else if (!row){
                reject(404);
            }
            else if (row.owner!=userId){
                reject(403);
            }
            else if (row.completed){
                reject(409);
            }
            else{
                const sqlDelete= "DELETE FROM reviews WHERE filmId = ? AND reviewerId = ?";
                db.run(sqlDelete,[filmId,reviewerId],(err)=>{
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


exports.issueFilmReviews= function (invitations,userId,filmId){
    return new Promise((resolve,reject)=>{

        const sqlGet1 = "SELECT id,owner, private FROM films WHERE id = ?";

        db.get(sqlGet1,filmId,(err,filmRow)=>{
            if(err){
                reject(err);
            }
            else if(!filmRow){
                reject(404);
            }
            else if (filmRow.owner!==userId) {
                reject(403);
            }
            else if(filmRow.private){
                reject(409);
            }
            else{
                let sqlGet2="SELECT * FROM users";
                let invitedUsers = [];
                for (let i = 0 ; i<invitations.length; i++){
                    if (!i) sqlGet2=sqlGet2+" WHERE id = ?";
                    else sqlGet2=sqlGet2 + " OR id = ?"
                    invitedUsers[i]=invitations[i].reviewerId
                }
                db.all(sqlGet2,invitedUsers,async function(err,rows){
                    if(err){
                        reject(err);
                    }
                    else if (rows.length !== invitations.length){
                        reject(409);
                    }
                    else{
                        const sqlInsert= "INSERT INTO reviews(filmId,reviewerId,completed) VALUES (?,?,?)";
                        var result = [];
                        for (let i=0; i<invitations.length;i++){
                            try{
                                result[i]= await issueSingleFilmReview(sqlInsert,parseInt(filmId),invitations[i].reviewerId,0)
                            }
                            catch(err){
                                if (err.code === 'SQLITE_CONSTRAINT'){
                                    reject(409)
                                }
                                else{
                                reject (err);
                                }

                            }

                        }
                        if (result.length>0){
                            resolve(result);
                        }
                    }

                })



            }
        })



    })
}

    const issueSingleFilmReview = (sql,filmId,reviewerId)=>{
        return new Promise((resolve,reject)=>{
            db.run(sql,[filmId,reviewerId,0],(err)=>{
                if (err){
                    reject(err)
                }
                else{
                    resolve(new Review(filmId,reviewerId,false));
                }
            })
        })

    }
        






    











const getPage = (pageNo) => {
    var page = pageNo>0 ? pageNo : 1;

    var pageSize = parseInt(constants.OFFSET);
    var limit=[];
    limit.push(pageSize * (page -1) );
    limit.push(pageSize);
    return limit;
}

    const parseReview = (row,user) => {
        let showModificationRequests= false;
        if(user && (user.id===row.owner || user.id === row.reviewerId)){
            showModificationRequests=true
        }
        let isReviewer=false
        if(user && user.id===row.reviewerId){
            isReviewer=true
        }



        return new Review(row.filmId, row.reviewerId, Boolean(row.completed), row.reviewDate, row.rating, row.review,showModificationRequests,isReviewer)


    }