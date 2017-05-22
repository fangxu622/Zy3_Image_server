/**
 * Created by Administrator on 2017/4/13.
 */
var mongoose = require("mongoose");

var db = mongoose.connect("mongodb://127.0.0.1:27017/blog");
db.connection.on("error", function (error) {
    console.log("数据库连接失败：" + error);
});
db.connection.on("open", function () {
    console.log("——数据库连接成功！——");
});

var usersSchema=new mongoose.Schema({
    username:String,
    password:String
},{collection:'users'});


var jobSchema=new mongoose.Schema({
    jobId:String,
    username:String,
    jobName:String,
    jobTime:Date,
    jobcompleteTime:Date,
    jobDataMoveTime:Date,
    jobDownload:String,
    jobStatus:String,
    //jobsheet:{name:[],objectid:[]}
    objectname:{type:String},
    objectid:{type:String},
    jobShape:{type:String},
    jobPurpose:{type:String},
    jobNote:{type:String}
},{collection:'job'});

var userModel=db.model('users',usersSchema);
var jobModel=db.model('job',jobSchema);
// model2.find({email:"fangxu622@126.com"},function(err,data){
//     console.log(data);
// })

exports.userModel=userModel;
exports.jobModel=jobModel;