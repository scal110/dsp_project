'use strict'

const ReviewModification = require('../components/reviewModification');
const db = require('../components/db');
const constants = require('../utils/costants')

exports.requestModification = function (filmId, reviewerId, mRequest, userId) {
    return new Promise((resolve, reject) => {
        const sqlGet = "SELECT * FROM reviews WHERE filmId = ? AND reviewerId = ?"

        db.get(sqlGet, [filmId, reviewerId], (err, row) => {
            if (err) {
                reject(err)
            }
            else if (!row) {
                reject(404)
            }
            else if (row.reviewerId != userId) {
                reject(403)
            }
            else if (!row.completed) {
                reject(409)
            }
            else {
                const sqlGet2 = "SELECT status FROM review_modifications  WHERE filmId = ? AND reviewerId = ?";

                db.all(sqlGet2, [filmId, reviewerId], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else if (rows.length > 0 && rows.map(r => r.status).includes(null)) {
                        reject(409);
                    }
                    else {
                        const sqlCreate = "INSERT INTO review_modifications(filmId,reviewerId,deadline) VALUES(?,?,?)";

                        db.run(sqlCreate, [filmId, reviewerId, mRequest.deadline], function (err) {
                            if (err) {
                                reject(err)
                            }
                            else {
                                resolve(new ReviewModification(this.lastID, parseInt(filmId), parseInt(reviewerId), mRequest.deadline))
                            }
                        })

                    }
                })




            }
        })



    })

}


exports.getSingleModificationRequest = function (mId, userId) {
    return new Promise((resolve, reject) => {
        const sqlGet = "SELECT f.owner as owner,m.mId, m.filmId,m.reviewerId,m.deadline,m.status FROM films f, review_modifications m WHERE f.id=m.filmId AND mId = ?";
        db.get(sqlGet, [mId], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(404);
            }
            else if (row.owner != userId && row.reviewerId != userId) {
                reject(403)
            }
            else {
                resolve(parseReviewModification(row, row.owner === userId,row.reviewerId===userId))
            }
        })
    })
}

exports.acceptModificationRequest = function (mId, userId) {
    return new Promise((resolve, reject) => {
        const sqlGet = "SELECT f.owner as owner,m.filmId,m.reviewerId,m.status FROM films f, review_modifications m WHERE f.id=m.filmId AND mId = ?";
        db.get(sqlGet, [mId], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(404);
            }
            else if (row.owner != userId) {
                reject(403)
            }
            else if (row.status !== null) {
                reject(409)
            }
            else {
                const sqlUpdate = "UPDATE review_modifications SET status = ? WHERE mId = ?";
                db.run(sqlUpdate, [true, mId], (err) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        const sqlUpdate2 = "UPDATE reviews SET completed= ? WHERE filmId= ? AND reviewerId=?";
                        db.run(sqlUpdate2, [false, row.filmId, row.reviewerId], (err) => {
                            if (err) {
                                reject(err)
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            }
        })
    })

}

exports.rejectModificationRequest = function (mId, userId) {
    return new Promise((resolve, reject) => {
        const sqlGet = "SELECT f.owner as owner,m.status FROM films f, review_modifications m WHERE f.id=m.filmId AND mId = ?";
        db.get(sqlGet, [mId], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(404);
            }
            else if (row.owner != userId) {
                reject(403)
            }
            else if (row.status !== null) {
                reject(409)
            }
            else {
                const sqlUpdate = "UPDATE review_modifications SET status = ? WHERE mId = ?";
                db.run(sqlUpdate, [false, mId], (err) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve()
                    }
                })
            }
        })
    })

}

exports.getReviewsModificationRequestsReceived = function (req) {
    return new Promise((resolve, reject) => {
        const sqlCount = 'SELECT COUNT(*) total FROM films f,review_modifications m WHERE f.id=m.filmId AND f.owner= ?';


        db.get(sqlCount, [req.user.id], (err, size) => {
            if (err) {
                reject(err);
                return;
            }


            const total = Math.ceil(size.total/constants.OFFSET);
            let pageNo = parseInt(req.query.pageNo) || 1;

            // If the selected page is greater than the totalPages the last one is returned
            const limit = getPage((pageNo > total) ? total : pageNo);
            let sqlGet = 'SELECT * FROM review_modifications WHERE filmId IN (SELECT id FROM films WHERE owner = ?) ORDER BY status IS NOT NULL, mId';



            if (limit.length !== 0) {
                sqlGet = sqlGet + ' LIMIT ?,?';
            }


            db.all(sqlGet, [req.user.id, ...limit], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                let mRequests = [];
                if (rows.length > 0) {
                    mRequests = rows.map(row => parseReviewModification(row,true,row.reviewerId===req.user.id));
                }


                resolve({ total: total, mRequests: mRequests });
            });
        });
    });
}

exports.getReviewModificationRequestsStatus = function (req) {
    return new Promise((resolve, reject) => {
        const sqlCount = 'SELECT COUNT(*) total FROM review_modifications WHERE reviewerId = ?';


        db.get(sqlCount, [req.user.id], (err, size) => {
            if (err) {
                reject(err);
                return;
            }


            const total = Math.ceil(size.total/constants.OFFSET);
            let pageNo = parseInt(req.query.pageNo) || 1;

            // If the selected page is greater than the totalPages the last one is returned
            const limit = getPage((pageNo > total) ? total : pageNo);
            let sqlGet = 'SELECT f.owner as owner, m.mId,m.filmId,m.reviewerId,m.deadline,m.status FROM films f,review_modifications m WHERE f.id=m.filmId AND m.reviewerId = ? ORDER BY status IS NOT NULL, m.mId';



            if (limit.length !== 0) {
                sqlGet = sqlGet + ' LIMIT ?,?';
            }


            db.all(sqlGet, [req.user.id, ...limit], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                let mRequests = [];
                if (rows.length > 0) {
                    mRequests = rows.map(row => parseReviewModification(row,row.owner===req.user.id,row.reviewerId===req.user.id));
                }


                resolve({ total: total, mRequests: mRequests });
            });
        });
    });
}

exports.getSingleFilmReviewModificationRequests = function (req) {
    return new Promise((resolve, reject) => {
        const sqlCount = 'SELECT COUNT(*) total FROM review_modifications WHERE filmId= ? AND reviewerId = ?';

        db.get(sqlCount, [req.params.filmId, req.params.reviewerId], (err, size) => {
            if (err) {
                reject(err);
                return;
            }


            const total = Math.ceil(size.total/constants.OFFSET);
            let pageNo = parseInt(req.query.pageNo) || 1;

            // If the selected page is greater than the totalPages the last one is returned
            const limit = getPage((pageNo > total) ? total : pageNo);
            let sqlGet = 'SELECT f.owner as owner, m.mId,m.filmId,m.reviewerId,m.deadline,m.status FROM films f,review_modifications m WHERE f.id=m.filmId AND m.filmId= ? AND m.reviewerId = ? ORDER BY m.status IS NOT NULL, m.mId';


            if (limit.length !== 0) {
                sqlGet = sqlGet + ' LIMIT ?,?';
            }


            db.all(sqlGet, [req.params.filmId, req.params.reviewerId, ...limit], (err, rows) => {
                let mRequests = [];
                if (err) {
                    reject(err);
                    return;
                }
                else if (rows.length > 0) {

                    if (!(rows[0].owner !== req.user.id) && !(req.params.reviewerId !== req.user.id)) {
                        reject(403);
                        return;
                    }

                    else {
                        mRequests = rows.map(row => parseReviewModification(row, row.owner === req.user.id,row.reviewerId===req.user.id));
                    }

                }
                resolve({ total: total, mRequests: mRequests });
            });
        });
    });
} 

exports.deleteSingleReviewModificationRequest = function (mId, userId) {
    return new Promise((resolve, reject) => {
        const sqlGet = "SELECT reviewerId,status FROM review_modifications WHERE mId = ?";
        db.get(sqlGet, [mId], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(404);
            }
            else if (row.reviewerId !== userId) {
                reject(403)
            }
            else if (row.status !== null) {
                reject(409)
            }
            else {
                const sqlDelete = "DELETE FROM review_modifications WHERE mId = ?";
                db.run(sqlDelete, [mId], (err) => {
                    if (err) {
                        reject(err)

                    }
                    else {
                        resolve();
                    }
                })
            }
        })

    })
}


const updateStatusAfterExpiration = function (mId) {

    return new Promise((resolve, reject) => {
        const sql = "UPDATE review_modifications SET status = 0 WHERE status IS NULL AND mId=?"
        db.run(sql, [mId], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
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

const parseReviewModification = (row, isOwner,isReviewer) => {
    let status = null
    if (row.status !== null) {
        status = Boolean(row.status)
    }
    else if (new Date(row.deadline) < new Date()) {
        updateStatusAfterExpiration(row.mId);
        status = false
        console.log("UPDATED")
    }
    return new ReviewModification(row.mId, row.filmId, row.reviewerId, row.deadline, status, isOwner,isReviewer)


}