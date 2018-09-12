var express = require('express');
var Auth0Strategy = require('passport-auth0');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var mcache = require('memory-cache');

var cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    console.log("Connection Succeeded1");
    if (cachedBody) {
      res.send(cachedBody)
      console.log("Connection Succeeded2");
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
        console.log("Connection Succeeded3");
      }
      console.log("Connection Succeeded4");
      next()
    }
  }
}

module.exports = (app, passport) => {
 
  app.get('/', (req,res) => {
    if(req.isAuthenticated()){
      res.redirect("/map");
    }
    res.redirect('/login');
  });

  app.get('/login',
    passport.authenticate('auth0', {scope: 'openid email profile'}), function (req, res) {
    res.redirect("/map");
  });

  app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/profile");
  });

  app.get('/profile', ensureLoggedIn, function(req, res, next) {
    //console.log(req.user);
    res.render('profile', {
      user: req.user ,
      userProfile: JSON.stringify(req.user, null, '  ')
    });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    throw new Error('Sesión Cerrada');
  });

  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    return res.redirect('/');
  }

  app.get('/map', cache(10), (req,res)=>{
    //setTimeout(() => {
      res.render('map',{
        user:req.user
      });
    //}, 5000)
  });
}
