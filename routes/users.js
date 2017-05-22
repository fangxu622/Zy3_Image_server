var express = require('express');

var dbModel=require('../bin/mongo');

var ogr2ogr = require('ogr2ogr')
var fs = require('fs')
var fstream=require('fstream');
var zlib=require('zlib');
var tar=require('tar');


var multiparty = require('connect-multiparty');

var router = express.Router();


var gzip = zlib.createGzip();


function enableCors (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
}

function optionsHandler (methods) {
  return function (req, res, next) {
    res.header('Allow', methods)
    res.send(methods)
  }
}
router.options('/convert', enableCors, optionsHandler('POST'))

router.post('/convert',multiparty(), function (req, res, next) {
  var ogr = ogr2ogr(req.files.upload.path)
  console.log(req.files)
  if (req.body.targetSrs) {
    ogr.project(req.body.targetSrs, req.body.sourceSrs)
  }

  if ('skipFailures' in req.body) {
    ogr.skipfailures();
  }

  res.header('Content-Type', 'forcePlainText' in req.body ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8')

  ogr.exec(function (er, data) {
    fs.unlink(req.files.upload.path)
    if (er) return res.json({ errors: er.message.replace('\n\n','').split('\n') })
    if (req.body.callback) res.write(req.body.callback + '(')
    res.write(JSON.stringify(data))
    if (req.body.callback) res.write(')')
    res.end()
  })
})


/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

var src="D:\\arcgisserver\\directories\\arcgisjobs\\onemapclip_gpserver\\";

router.post('/copyfile',function (req,res,next) {
  var id=req.body.id;


  if(isNaN(id)){//说明ID是非数字的，也就是通过裁剪提交的任务

    var inpath=src+id+"\\scratch\\outimg.tif";
    var r=fstream.Reader({ 'path' : inpath, 'type' : 'File' });

    dbModel.jobModel.findOne({jobId:id},'username jobName',function(err,data){

      if(data){
        var outpath="D:\\ImagePro\\tar\\"+data.username+"-"+data.jobName+".tif.gz";
        var w=fstream.Writer(outpath);
        var downloadlink="http://localhost:8082/tar/"+data.username+"-"+data.jobName+".tif.gz";
        r.pipe(tar.Pack())/* Convert the directory to a .tar file */
            .pipe(zlib.Gzip())/* Compress the .tar file */
            .pipe(w); // Write back to the response, or wherever else...

        r.on('ready',function(){
          dbModel.jobModel.findOneAndUpdate({jobId:id},{"jobStatus":"extractedStart"},function(err,data){
            //console.log(data);
            res.json(1);
          })
        })
        r.on('end',function(){//,"jobDownload":outpath
          dbModel.jobModel.findOneAndUpdate({jobId:id},{"jobStatus":"extractedSuccess","jobDownload":downloadlink,"jobDataMoveTime":new Date},function(err,data){

          })
        })
      }
      else{
        res.json(0);
      }

    })

  }else{
   var inpath="E:\\OneMap\\";

    dbModel.jobModel.findOne({jobId:id},'objectname',function(err,data){
      if(data.objectname){
        //var taskname=transliteration.transliterate(data.objectname);
        var str=data.objectname.substr(0,3);
        inpath=inpath+str+"\\"+data.objectname+".tif";

        var outpath="D:\\ImagePro\\tar\\"+data.objectname+".tif.gz";
        var downloadlink="http://localhost:8082/tar/"+data.objectname+".tif.gz";

        var rr=fstream.Reader({ 'path' : inpath, 'type' : 'File' });
        var w=fstream.Writer(outpath);

        rr.pipe(tar.Pack())/* Convert the directory to a .tar file */
            .pipe(zlib.Gzip())/* Compress the .tar file */
            .pipe(w); // Write back to the response, or wherever else...

        rr.on('ready',function(){
          dbModel.jobModel.findOneAndUpdate({jobId:id},{"jobStatus":"extractedStart"},function(err,data){
            //console.log(data)
            res.json(1);
          })
        })
        rr.on('end',function(){
          dbModel.jobModel.findOneAndUpdate({jobId:id},{"jobStatus":"extractedSuccess","jobDownload":downloadlink,"jobDataMoveTime":new Date},function(err,data){

            //res.json(1);
          })
        })

      }else{
        res.json(0);
      }
    })

  }
})

router.post('/sheetdownload',function(req,res,next){
  var str=req.body.sheetname;
      if(str){
        console.log(str+"*****************");
        res.json(1)
      }
})

  router.post('/locations',function(req,res,next){
    dbModel.jobModel.findOne({jobId:req.body.id},function(err,data){
      if(err){
        res.josn(0);
      }else{
        //console.log(JSON.parse(data.jobShape));
        res.json(data);
      }
    })
  })

module.exports = router;
