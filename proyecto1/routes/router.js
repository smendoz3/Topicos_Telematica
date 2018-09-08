//app.get('/', cache(10), (req, res) => {
  //setTimeout(() => {
    //res.render('index', { title: 'Hey', message: 'Hello there', date: new Date()})
  //}, 5000) //setTimeout was used to simulate a slow processing request
//})
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
      res.render('index')
  });

  app.get('/login', (req,res) => {
      res.render('login', {
        message: req.flash('mensajeLogin')
      }); 
  });
  
  app.post('/login',passport.authenticate('local-login',{
    successRedirect:'/map',
    failureRedirect:'/login',
    failureFlash:true  
  })); 

  

  app.get('/registrar', (req,res) => {
      res.render('registrar',{
        message: req.flash('mensajeRegistro')
      });
  });

  app.post('/registrar',passport.authenticate('local-registro', {
    successRedirect:'/login',
    failureRedirect:'/registrar',
    failureFlash:true

  }));

  app.get('/profile',isLoggedIn, (req,res) => {
      res.render('profile',{
        user:req.user
      });
  });

  app.get('/logout', (req,res) => {
      req.logout();
      res.redirect('/');
  });

  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    return res.redirect('/');
  }

  app.get('/map', cache(10), (req,res)=>{
    setTimeout(() => {
      res.render('map',{
        user:req.user
      });
    }, 5000)
  });
}