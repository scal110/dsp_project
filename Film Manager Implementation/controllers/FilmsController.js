'use strict'

var writer= require("../utils/writer.js");
var Films = require("../service/FilmsService");
var constants= require("../utils/costants.js");
const Film = require("../components/film.js");


module.exports.createFilm = function createFilm(req,res,next){
    Films.createFilm(req.body,req.user.id)
        .then((response)=>{
            writer.writeJson(res,response,201);
        })
        .catch((error)=>{
            writer.writeJson(res,{ errors: [{ 'param': 'Server', 'msg': error }], }, 500);
        })
}


module.exports.getPublicFilms = function getPublicFilms(req,res,next){
    Films.getPublicFilms(req).
    then((response)=>{
        var pageNo= parseInt(req.query.pageNo) || 1;
        if (pageNo<=0){
            pageNo=1
        }
        var totalPages=response.total;

        writer.writeJson(res, {
            totalPages:totalPages,
            currentPage:pageNo>=totalPages ?totalPages : pageNo,
            films:response.films,
            next: (pageNo<totalPages) ? "/api/films/public?pageNo=" + (pageNo+1) : null

        },200)

    }).catch((error)=>{
        writer.writeJson(res, {
            errors:[{'param':'Server','msg':error}]
        },500);

    });
};

module.exports.getOwnedFilms = function getOwnedFilms(req,res,next){
    Films.getOwnedFilms(req).
    then((response)=>{
        var pageNo= parseInt(req.query.pageNo) || 1;
        if (pageNo<=0){
            pageNo=1
        }
        var totalPages=response.total;

        writer.writeJson(res, {
            totalPages:totalPages,
            currentPage:pageNo>=totalPages ?totalPages : pageNo,
            films:response.films,
            next: (pageNo<totalPages) ? "/api/films?pageNo=" + (pageNo+1) : null

        },200)

    }).catch((error)=>{
        writer.writeJson(res, {
            errors:[{'param':'Server','msg':error}]
        },500);

    });
};

module.exports.getSinglePublicFilm = function getSinglePublicFilm(req,res,next){
    Films.getSinglePublicFilm(req.params.filmId)
    .then((response)=>{
        writer.writeJson(res,response,200);

    }).catch((error)=>{
        if (error == 404){
            writer.writeJson(res,{errors:[{'param':'Server','msg':'Film Not Found'}]},404);
        }
        else {
            writer.writeJson(res,{errors:[{'param':'Server','msg':error}]},500);
        }
    })
}

module.exports.getPrivateFilms =function getPrivateFilms(req,res,next){
    Films.getPrivateFilms(req)
        .then((response)=>{
            var pageNo= parseInt(req.query.pageNo) || 1;
            if (pageNo<=0){
                pageNo=1
            }
            var totalPages=response.total;
    
            writer.writeJson(res, {
                totalPages:totalPages,
                currentPage:pageNo>=totalPages ?totalPages : pageNo,
                films:response.films,
                next: (pageNo<totalPages) ? "/api/films/private?pageNo=" + (pageNo+1) : null
    
            },200)
       
        }).catch((error)=>{
            writer.writeJson(res, {
                errors:[{'param':'Server','msg':error}]
            },500);
    
        });
    };

    module.exports.getSinglePrivateFilm = function getSinglePrivateFilm(req,res,next){
        Films.getSinglePrivateFilm(req)
        .then((response)=>{
            writer.writeJson(res,response,200);
    
        }).catch((error)=>{
            if (error == 404){
                writer.writeJson(res,{errors:[{'param':'Server','msg':'Film Not Found'}]},404);
            }
            else if (error == 403){
                writer.writeJson(res,{errors:[{'param':'Server','msg':'The user in not the owner of the film'}]},403);
            }
            else {
                writer.writeJson(res,{errors:[{'param':'Server','msg':error}]},500);
            }
        })
    }

    module.exports.updateSinglePrivateFilm= function updateSinglePrivateFilm(req,res,next){
        Films.updateSinglePrivateFilm(req.body,req.params.filmId,req.user.id)
            .then((response)=>{
                writer.writeJson(res,response,204);
            })
            .catch(function(error){
                if(error ==403){
                    writer.writeJson(res, {errors: [{'param':'Server', 'msg': 'The user is not the owner of the film'}]},403)
                }
                else if (error == 404){
                    writer.writeJson(res,{errors:[{'param':'Server','msg':'Film Not Found'}]},404);
                }
                else if (error == 409){
                    writer.writeJson(res,{errors:[{'param':'Server','msg':'The visibility cannot be changed'}]},409);
                }
                else {
                    writer.writeJson(res,{errors:[{'param':'Server','msg':error}]},500);
                }
            })
    }

    module.exports.deleteSinglePrivateFilm= function deleteSinglePrivateFilm(req,res,next){
        Films.deleteSinglePrivateFilm(req.params.filmId,req.user.id)
            .then((response)=>{
                writer.writeJson(res,response,204);
            }).catch ((error)=>{
                if(error ==403){
                    writer.writeJson(res, {errors: [{'param':'Server', 'msg': 'The user is not the owner of the film'}]},403)
                }
                else if (error == 404){
                    writer.writeJson(res,{errors:[{'param':'Server','msg':'Film Not Found'}]},404);
                }
                else {
                    writer.writeJson(res,{errors:[{'param':'Server','msg':error}]},500);
                }

            })
        }

        module.exports.updateSinglePublicFilm= function updateSinglePublicFilm(req,res,next){
            Films.updateSinglePublicFilm(req.body,req.params.filmId,req.user.id)
                .then((response)=>{
                    writer.writeJson(res,response,204);
                })
                .catch(function(error){
                    if(error ==403){
                        writer.writeJson(res, {errors: [{'param':'Server', 'msg': 'The user is not the owner of the film'}]},403)
                    }
                    else if (error == 404){
                        writer.writeJson(res,{errors:[{'param':'Server','msg':'Film Not Found'}]},404);
                    }
                    else if (error == 409){
                        writer.writeJson(res,{errors:[{'param':'Server','msg':'The visibility cannot be changed'}]},409);
                    }
                    else {
                        writer.writeJson(res,{errors:[{'param':'Server','msg':error}]},500);
                    }
                })
        }
    
        module.exports.deleteSinglePublicFilm= function deleteSinglePublicFilm(req,res,next){
            Films.deleteSinglePublicFilm(req.params.filmId,req.user.id)
                .then((response)=>{
                    writer.writeJson(res,response,204);
                }).catch ((error)=>{
                    if(error ==403){
                        writer.writeJson(res, {errors: [{'param':'Server', 'msg': 'The user is not the owner of the film'}]},403)
                    }
                    else if (error == 404){
                        writer.writeJson(res,{errors:[{'param':'Server','msg':'Film Not Found'}]},404);
                    }
                    else {
                        writer.writeJson(res,{errors:[{'param':'Server','msg':error}]},500);
                    }
    
                })
            }

            module.exports.getInvited = function getInvited(req, res, next) {
                Films.getInvited(req)
                    .then((response) => {
                        var pageNo = parseInt(req.query.pageNo) || 1;
                        if (pageNo<=0){
                            pageNo=1
                        }
                        var totalPages = response.total;
            
                        writer.writeJson(res, {
                            totalPages: totalPages,
                            currentPage: pageNo >= totalPages ? totalPages : pageNo,
                            films: response.films,
                            next: (pageNo < totalPages) ? "/api/films/public/invited?pageNo=" + (pageNo + 1) : null
            
                        },200)
                    }).catch((error) => {
                        if (error == 404) {
                            writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Films Not Found' }] }, 404);
                        }
                        else {
                            writer.writeJson(res, { errors: [{ 'param': 'Server', 'msg': error }] }, 500);
                        }
                    })
            
            }
    