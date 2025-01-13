class ReviewModification{
    constructor(mId,filmId,reviewerId,deadline,status,owner){
        this.mId=mId;
        this.filmId=filmId;
        this.reviewerId=reviewerId;
        this.deadline=deadline;
        this.status=status;

        this.self= "/api/films/public/reviews/modifications/" + this.mId;
        this.review="/api/films/public/" +this.filmId +"/reviews/"+this.reviewerId
        if(owner && !status){
        this.accept="/api/films/public/reviews/modifications/"+this.mId +"/accept";
        this.reject="/api/films/public/reviews/modifications/"+this.mId +"/reject";
        }
    }
}

module.exports=ReviewModification