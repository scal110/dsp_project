class Review{
    constructor(filmId,reviewerId,completed,reviewDate,rating,review,showModificationRequests,isReviewer){
        this.filmId=filmId;
        this.reviewerId=reviewerId;
        this.completed=completed;
        
        if(reviewDate)
            this.reviewDate=reviewDate;
        if(rating)
            this.rating=rating;
        if(review)
            this.review=review

        if(isReviewer && !completed){
            this.delete="/api/films/public/" + this.filmId + "/reviews/" + this.reviewerId                        
        }
        this.film="/api/films/public/" + this.filmId

        if(showModificationRequests){
        this.modificationReq="/api/films/public/" + this.filmId + "/reviews/"+ this.reviewerId+"/modifications" ;
        }
        

        this.self= "/api/films/public/" + this.filmId + "/reviews/" + this.reviewerId
    }
}

module.exports=Review