/* eslint-disable global-require */
const express = require('express');
const path = require('path');
const compression = require('compression');
const pkg = require(path.resolve(process.cwd(), 'package.json'));
var btoa = require('btoa');
var https = require('https');
var querystring = require('querystring');
var conf = require('../../app/conf');
// Dev middleware
const addDevMiddlewares = (app, webpackConfig) => {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);
  const middleware = webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    silent: true,
    stats: 'errors-only',
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.fileSystem;

  if (pkg.dllPlugin) {
    app.get(/\.dll\.js$/, (req, res) => {
      const filename = req.path.replace(/^\//, '');
      res.sendFile(path.join(process.cwd(), pkg.dllPlugin.path, filename));
    });
  }

  app.get('*', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(file.toString());
      }
    });
  });

  function sendReq(option,dest,req,cb){
    var host = conf.host;
    var myCookie = req.headers["set-cookie"]||'';
    var request=require('request');
    request({
      uri: "https://"+host+"/api/"+dest,
      rejectUnauthorized:false,
      method: option,
      headers:{
        'Authorization':req.headers['Authorization'] || 'Basic',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': myCookie
      },
      form: req.body,
    }, function(error, response, body) {
          if(error) return console.log(error);
          cb(response,body);
    });
  }

  app.post('/home/settings/password',function(req,res,next){

    sendReq('PUT','users/'+req.body.username,req,function(response,body){
       res.send(response);
    });
  });

  app.post('/users/password_reset',function(req,res,next){

    sendReq('POST','sessions/forgot_password',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/home/settings/email',function(req,res,next){

    sendReq('POST','users/'+req.body.username+'/send_verification',req,function(response,body){
       res.send(response);
    });
  });

  app.post('/home/settings/profile',function(req,res,next){

    sendReq('PUT','users/'+req.body.username,req,function(response,body){
       res.send(response);
    });
  });

  app.post('/home/settings/email',function(req,res,next){

    sendReq('POST','users/'+req.body.username+'/send_verification',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/new',function(req,res,next){
    sendReq('POST','users',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/login',function(req,res,next){
    sendReq('POST','session',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/notifications',function(req,res,next) {
    sendReq('GET', 'users/'+req.body.username+'/notifications', req, function(response,body){
      res.send(body);
    })
  });

  app.post('/users/preferences', function(req,res,next) {
    sendReq(req.body.method,'users/'+req.body.username+'/preferences', req, function(response,body){
      res.send(body);
    })
  });

  app.post('/users/transactions', function(req,res,next) {
    sendReq(req.body.method, 'users/'+req.body.username+'/transactions', req, function(response,body) {
      res.send(body);
    });
  });

  app.post('/users/scenes',function(req,res,next){
    sendReq('GET','users/'+req.body.username+'/scenes/',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/stations/new',function(req,res,next){
    var query='?name='+req.body.name+'&visibility='+req.body.visibility+'&description='+req.body.description+'&tags[0]=freevi';
    sendReq('POST','scenes/'+req.body.sceneId+'/clone'+query,req,function(response,body,error){
      if(error) {
        res.send(response);
      } else {
        var json = JSON.parse(body);
        res.send(json);
      }
    });
  });

  app.post('/stations/info',function(req,res,next){
    sendReq('GET','scenes/'+req.body.sceneId,req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/info',function(req,res,next){
    sendReq('GET','users/'+req.body.username,req,function(response,body){
      res.send(body);
    });
  });

  app.post('/stations/comments',function(req,res,next){
    sendReq('GET','scenes/'+req.body.sceneId+'/comments',req,function(response,body){
      res.send(body);
    });
  });

  app.post('/stations/comment',function(req,res,next){
    sendReq('POST','scenes/'+req.body.sceneId+'/comments',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/stations/collection',function(req,res,next){
     sendReq('GET','collections/'+req.body.collection+'/scenes/',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/collection', function(req,res,next) {
    sendReq(req.body.method,'collections',req,function(response,body){
      res.send(body);
    });
  })
  app.post('/stations/update',function(req,res,next){
    sendReq('PUT','scenes/'+req.body.sceneId,req,function(response,body){
      res.send(body);
    });
  });
  app.post('/stations/delete',function(req,res,next){
    sendReq('DELETE','scenes/'+req.body.sceneId,req,function(response,body){
      res.send(response);
    });
  });

  app.post('/stations/like',function(req,res,next){
    var option;
    if(req.body.like == 'true'){
      option = 'DELETE';
    }
    else option = 'POST';
    sendReq(option,'scenes/'+req.body.sceneId+'/like',req,function(response,body){
      res.send(response);
    });
  });
};
// Production middlewares
const addProdMiddlewares = (app, options) => {
  const publicPath = options.publicPath || '/';
  const outputPath = options.outputPath || path.resolve(process.cwd(), 'build');

  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique
  // and other good practices on official Express.js docs http://mxs.is/googmy

  app.use(compression());
  app.use(publicPath, express.static(outputPath));

  app.get('*', (req, res) => {
    //console.log(req.session);
    if (!/chunks|claraplayer|\.jpg$|\.ico$|\.png|appcache|\.json/.test(req.path)) {
      res.sendFile(path.resolve(outputPath, 'index.html'))
    } else {
  //    console.log(req.path.substring(22))
      res.sendFile(path.resolve(outputPath, req.path.substring(22)))
    }
  });

  function sendReq(option,dest,req,cb){
    var host = conf.host;
    var myCookie = req.headers["set-cookie"]||'';
    var request=require('request');
    request({
      uri: "https://"+host+"/api/"+dest,
      rejectUnauthorized: false,
      method: option,
      headers:{
        'Authorization':'Basic',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': myCookie
      },
      form: req.body,
    }, function(error, response, body) {
          if(error) return console.log(error);
          cb(response,body);
    });
  }

  app.post('/home/settings/password',function(req,res,next){

    sendReq('PUT','users/'+req.body.username,req,function(response,body){
       res.send(response);
    });
  });

  app.post('/users/password_reset',function(req,res,next){

    sendReq('POST','sessions/forgot_password',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/home/settings/email',function(req,res,next){

    sendReq('POST','users/'+req.body.username+'/send_verification',req,function(response,body){
       res.send(response);
    });
  });

  app.post('/home/settings/profile',function(req,res,next){

    sendReq('PUT','users/'+req.body.username,req,function(response,body){
       res.send(response);
    });
  });

  app.post('/home/settings/email',function(req,res,next){

    sendReq('POST','users/'+req.body.username+'/send_verification',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/new',function(req,res,next){
    sendReq('POST','users',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/login',function(req,res,next){
    sendReq('POST','session',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/notifications',function(req,res,next) {
    sendReq('GET', 'users/'+req.body.username+'/notifications', req, function(response,body){
      res.send(body);
    })
  });

  app.post('/users/preferences', function(req,res,next) {
    sendReq(req.body.method,'users/'+req.body.username+'/preferences', req, function(response,body){
      res.send(body);
    })
  });

  app.post('/users/transactions', function(req,res,next) {
    sendReq(req.body.method, 'users/'+req.body.username+'/transactions', req, function(response,body) {
      res.send(body);
    });
  });

  app.post('/users/scenes',function(req,res,next){
    sendReq('GET','users/'+req.body.username+'/scenes/',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/stations/new',function(req,res,next){
    var query='?name='+req.body.name+'&visibility='+req.body.visibility+'&description='+req.body.description+'&tags[0]=freevi';
    sendReq('POST','scenes/'+req.body.sceneId+'/clone'+query,req,function(response,body,error){
      if(error) {
        res.send(response);
      } else {
        var json = JSON.parse(body);
        res.send(json);
      }
    });
  });

  app.post('/stations/info',function(req,res,next){
    sendReq('GET','scenes/'+req.body.sceneId,req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/info',function(req,res,next){
    sendReq('GET','users/'+req.body.username,req,function(response,body){
      res.send(body);
    });
  });

  app.post('/stations/comments',function(req,res,next){
    sendReq('GET','scenes/'+req.body.sceneId+'/comments',req,function(response,body){
      res.send(body);
    });
  });

  app.post('/stations/comment',function(req,res,next){
    sendReq('POST','scenes/'+req.body.sceneId+'/comments',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/stations/collection',function(req,res,next){
     sendReq('GET','collections/'+req.body.collection+'/scenes/',req,function(response,body){
      res.send(response);
    });
  });

  app.post('/users/collection', function(req,res,next) {
    sendReq(req.body.method,'collections',req,function(response,body){
      res.send(body);
    });
  })
  app.post('/stations/update',function(req,res,next){
    sendReq('PUT','scenes/'+req.body.sceneId,req,function(response,body){
      res.send(body);
    });
  });
  app.post('/stations/delete',function(req,res,next){
    sendReq('DELETE','scenes/'+req.body.sceneId,req,function(response,body){
      res.send(response);
    });
  });

  app.post('/stations/like',function(req,res,next){
    var option;
    if(req.body.like == 'true'){
      option = 'DELETE';
    }
    else option = 'POST';
    sendReq(option,'scenes/'+req.body.sceneId+'/like',req,function(response,body){
      res.send(response);
    });
  });
};

/**
 * Front-end middleware
 */
module.exports = (app, options) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    addProdMiddlewares(app, options);
  } else {
    const webpackConfig = require('../../internals/webpack/webpack.dev.babel');
    addDevMiddlewares(app, webpackConfig);
  }

  return app;
};
