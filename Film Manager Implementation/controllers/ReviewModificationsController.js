'use strict'

const ReviewModification = require("../components/reviewModification");
var writer = require("../utils/writer");
var ReviewModifications = require("../service/ReviewModificationsService");
var constants = require("../utils/costants");

module.exports.requestModification = function requestModification(req, res, next) {
    ReviewModifications.requestModification(req.params.filmId, req.params.reviewerId, req.body, req.user.id)
        .then((response) => {
            writer.writeJson(res, response, 201);
        }).catch((error) => {
            if (error == 403) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not a reviewer of the film' }] }, 403)
            }
            else if (error == 404) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Review Not Found' }] }, 404);
            }
            else if (error == 409) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review is not completed or is already present a pending modification request' }] }, 409);
            }
            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }

        })
}

module.exports.getSingleModificationRequest = function getSingleModificationRequest(req, res, next) {
    ReviewModifications.getSingleModificationRequest(req.params.mId, req.user.id)
        .then((response) => {
            writer.writeJson(res, response, 200);
        }).catch((error) => {
            if (error == 403) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not a reviewer or owner of the film' }] }, 403)
            }
            else if (error == 404) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Review Modification Request Not Found' }] }, 404);
            }
            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }

        })
}

module.exports.acceptModificationRequest = function acceptModificationRequest(req, res, next) {
    ReviewModifications.acceptModificationRequest(req.params.mId, req.user.id)
        .then((response) => {
            writer.writeJson(res, response, 204);
        }).catch((error) => {
            if (error == 403) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }] }, 403)
            }

            else if (error == 404) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Review Modification Request Not Found' }] }, 404);
            }

            else if (error == 409) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The modification request is not in a pending status' }] }, 404);
            }

            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }

        })
}
module.exports.rejectModificationRequest = function rejectModificationRequest(req, res, next) {
    ReviewModifications.rejectModificationRequest(req.params.mId, req.user.id)
        .then((response) => {
            writer.writeJson(res, response, 204);
        }).catch((error) => {
            if (error == 403) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }] }, 403)
            }

            else if (error == 404) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Review Modification Request Not Found' }] }, 404);
            }

            else if (error == 409) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The modification request is not in a pending status' }] }, 404);
            }

            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }

        })
}

module.exports.getReviewsModificationRequestsReceived = function getReviewsModificationRequestsReceived(req, res, next) {
    ReviewModifications.getReviewsModificationRequestsReceived(req)
        .then((response) => {
            var pageNo = parseInt(req.query.pageNo) || 1;
            if (pageNo<=0){
                pageNo=1
            }
            var totalPages = response.total;

            writer.writeJson(res, {
                totalPages: totalPages,
                currentPage: pageNo >= totalPages ? totalPages : pageNo,
                mRequests: response.mRequests,
                next: (pageNo < totalPages) ? "/api/films/public/reviews/modifications/received?pageNo=" + (pageNo + 1) : null

            }, 200)
        }).catch((error) => {
            writer.writeJson(res, {
                errors: [{ 'param': 'Server', 'msg': error }]
            }, 500);

        });
};

module.exports.getReviewModificationRequestsStatus = function getReviewModificationRequestsStatus(req, res, next) {
    ReviewModifications.getReviewModificationRequestsStatus(req)
        .then((response) => {
            var pageNo = parseInt(req.query.pageNo) || 1;
            if (pageNo<=0){
                pageNo=1
            }
            var totalPages = response.total;

            writer.writeJson(res, {
                totalPages: totalPages,
                currentPage: pageNo >= totalPages ? totalPages : pageNo,
                mRequests: response.mRequests,
                next: (pageNo < totalPages) ? "/api/films/public/reviews/modifications/status?pageNo=" + (pageNo + 1) : null

            }, 200)
        }).catch((error) => {
            writer.writeJson(res, {
                errors: [{ 'param': 'Server', 'msg': error }]
            }, 500);

        });
};

module.exports.getSingleFilmReviewModificationRequests = function getSingleFilmReviewModificationRequests(req, res, next) {
    ReviewModifications.getSingleFilmReviewModificationRequests(req)
        .then((response) => {
            var pageNo = parseInt(req.query.pageNo) || 1;
            if (pageNo<=0){
                pageNo=1
            }
            var totalPages = response.total;

            writer.writeJson(res, {
                totalPages: totalPages,
                currentPage: pageNo >= totalPages ? totalPages : pageNo,
                mRequests: response.mRequests,
                next: (pageNo < totalPages) ? "/api/films/public/"+req.params.filmId+"/reviews/"+req.params.reviewerId+"/modifications?pageNo=" + (pageNo + 1) : null

            }, 200)
        }).catch((error) => {
            if (error == 403) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not owner or the review is not assigned to him' }] }, 403)
            }
            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }

        })
}

module.exports.deleteSingleReviewModificationRequest = function deleteSingleReviewModificationRequest(req,res,next){
    ReviewModifications.deleteSingleReviewModificationRequest(req.params.mId,req.user.id)
        .then((response) => {
            writer.writeJson(res, response, 204);
        }).catch((error) => {
            if (error == 403) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review modification is not related to the user' }] }, 403)
            }
            else if (error == 404) {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Review Modification Request Not Found' }] }, 404);
            }
            else if (error == 409){
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review modification request is not in a pending status' }] }, 409);
            }
            else {
                writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
            }

        })
}
