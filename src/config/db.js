const mongoose = require('mongoose')

const uri = process.env.MONGODB_URI;

const connectDB = async() => {
    try{
        //call the database
      await mongoose.connect(uri);
      console.log("Connected to MONGODB Database");
    }catch(err){
        console.log(err);
    }
  
}

module.exports = {connectDB, mongoose}
