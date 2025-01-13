'use strict'

const Review = require("../components/review");
var writer = require("../utils/writer");
var Reviews = require("../service/ReviewsService");
var constants = require("../utils/costants");

module.exports.getFilmReviews = function getFilmReviews(req, res, next) {
    Reviews.getFilmReviews(req)

        .then((response) => {
            let pageNo = parseInt(req.query.pageNo) || 1;
            let totalPages = Math.ceil(response.total / constants.OFFSET);

            writer.writeJson(res, {
                totalPages: totalPages,
                currentPage: pageNo >= totalPages ? totalPages : pageNo,
                reviews: response.reviews,
                next: (pageNo < totalPages) ? "/api/films/public/" + req.params.filmId + "?pageNo=" + (pageNo + 1) : null

            })

        }).catch((error) => {
            writer.writeJson(res, {
                errors: [{ 'param': 'Server', 'msg': error }]
            }, 500);

        });
};

module.exports.getSingleReview = function getSingleReview(req, res, next) {
    Reviews.getSingleReview(req)
        .then((response) => {
            writer.writeJson(res, response);

        }).catch((error) => {
            if (error == 404) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Review Not Found' }] }, 404);
            }
            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }
        })
}




module.exports.completeSingleReview = function completeSingleReviewe(req, res, next) {
    Reviews.completeSingleReview(req)
        .then((response) => {
            writer.writeJson(res, response, 204);
        })
        .catch(function (error) {
            if (error == 403) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review is not assigned to the user' }] }, 403)
            }
            else if (error == 404) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Review Not Found' }] }, 404);
            }
            else if (error == 409) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review is already completed' }] }, 409);
            }
            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }
        })
}

module.exports.deleteIncompleteReview = function deleteIncompleteReview(req, res, next) {
    Reviews.deleteIncompleteReview(req.params.filmId, req.user.id, req.params.reviewerId)
        .then((response) => {
            writer.writeJson(res, response, 204);
        }).catch((error) => {
            if (error == 403) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }] }, 403)
            }
            else if (error == 404) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Review Not Found' }] }, 404);
            }
            else if (error == 409){
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Is not possible to delete a complete review' }] }, 409);
            }
            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }

        })
}

module.exports.issueFilmReviews= function issueFlmReviews(req,res,next){
    Reviews.issueFilmReviews(req.body,req.user.id)
    .then((response) => {
        writer.writeJson(res, response, 201);
    }).catch((error) => {
        if (error == 403) {
            writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }] }, 403)
        }
        else if (error == 404) {
            writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Film Not Found' }] }, 404);
        }
        else if (error == 409){
            writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Invalid film or reviewerId' }] }, 404);
        }
        else {
            writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
        }

    })
}