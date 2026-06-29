//this file will handle connection logic to mongo database

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/EnhancedTaskManagerDB').then(() => {
    console.log("Connected to the database :)");
}).catch((e) => {
    console.log("Error while connecting to the database");
    console.log(e);
});

module.exports = {
    mongoose
};
