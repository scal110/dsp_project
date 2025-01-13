class User{
    constructor(id,name,email,hash){
        this.id=id;
        this.name=name;
        this.email=email 

        if(hash)
            this.hash=hash
        
        this.self= "/api/users" + this.id;

    
    }
}

module.exports = User;