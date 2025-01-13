class Film{
    constructor(id,title,owner,privateFilm,watchDate,rating,favourite){
        this.id=id;
        this.title=title;
        this.owner=owner;
        this.private=privateFilm;
        
        if (watchDate)
            this.watchDate=watchDate;
        if (rating)
            this.rating=rating;
        if (favourite)
            this.favourite=favourite;

        if (!this.private)
            this.reviews = "/api/reviews/public/" + this.id + "/reviews";

        this.self= "/api/films/" + (this.private ? "private/" : "public/") + this.id;


        
    }
}

module.exports= Film;