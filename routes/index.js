var express = require('express');
var dbModel=require('../bin/mongo');
var router = express.Router();

var islogin=false;
/* GET home page. */
router.get('/', function(req, res) {
  console.log(req.cookies.username);
    console.log("req.cookies.user");
  if(req.cookies.username){
    res.sendfile('./views/index.html');
  }
  else{
    res.sendfile('./views/login.html');
  }

});

router.get('/login', function (req,res,next){
  res.sendfile('./views/login.html');
})


router.get('/test', function (req,res,next){
  res.sendfile('./views/3.html');
})

router.post('/login', function (req,res,next){
  var username = req.body.username;
  var pwd = req.body.password;

  dbModel.userModel.findOne({username:username},'password',null,function(err,data){
    if(err){
        res.json(1)
    }
    else{
      console.log(data);
      if(data==null){
          res.json(2)
      }
      else {
        if(pwd==data.password){
          //res.cookie("user", {username: username}, {maxAge: 10000 , httpOnly: false});
          res.json(0);
        }else{
          res.json(1);
        }
      }
    }
  })

})

router.post('/job',function(req,res,next){

      dbModel.jobModel.findOne({jobId:req.body.jobId},function (err,data){
          //console.log(data.length);
          //console.log(data);
          if(!data){
              var jobModel=dbModel.jobModel;
              var job=new jobModel();
              job.jobId=req.body.jobId;
              job.jobName=req.body.jobName;
              job.username=req.body.username;
              job.jobStatus=req.body.jobStatus;
              job.jobTime=new Date();
              job.jobShape=req.body.jobShape;
              job.jobPurpose=req.body.jobPurpose;
              job.jobNote=req.body.jobNote;
              job.save();
              res.json(1);
          }else{
              res.json(0);
          }

      })

      // var jobModel=dbModel.jobModel;
      // var job=new jobModel();
      // job.jobId=req.body.jobId;
      // job.jobName=req.body.jobName;
      // job.username=req.body.username;
      // job.jobStatus=req.body.jobStatus;
      // job.jobTime=new Date();
      // job.save();

})

router.post('/sheetmap',function(req,res,next){
    var nameid=req.body.nameAndId;
    var name,objectid;
    if(nameid){
        name=nameid.substr(0,nameid.indexOf("*"));
        objectid=nameid.substr(nameid.indexOf("*")+1);
    }

    var jobModel=dbModel.jobModel;
    var job=new jobModel();
    var t=new Date();
    var s=t.getTime();

    job.jobId=s;
    job.jobName=req.body.jobName;
    job.username=req.body.username;
    job.jobStatus=req.body.jobStatus;
    job.jobTime=new Date();
    job.objectname=name;
    job.objectid=objectid;
    job.jobShape=req.body.jobShape;
    job.jobPurpose=req.body.jobPurpose;
    job.jobNote=req.body.jobNote;
    job.save();

    res.json(1);
})

//获得工作任务信息
router.post('/jobinfo',function(req,res,next){

  dbModel.jobModel.find({username:req.body.username},null,function(err,data){
    if(err){res.json(0)}
    else{
        res.json(data)
    }
  })
})

router.post('/updatejob',function(req,res,next){

    //console.log(req.body);
    var time=new Date();
    dbModel.jobModel.findOneAndUpdate({jobId:req.body.jobId,username:req.body.username},{"jobStatus":req.body.jobStatus,"jobDownload":req.body.jobDownload,"jobcompleteTime":time},function(err,data){
    //console.log("reqset"+data);
    if(err){res.json(0)}
    else{res.json(1)}
  })
})

module.exports = router;
