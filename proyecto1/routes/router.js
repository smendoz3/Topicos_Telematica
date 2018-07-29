module.exports = (app, passport) => {
 
  app.get('/',(req,res) => {
    res.render('index')
  })

  app.get('/login',(req,res) => {
    res.render('login', {
      message: req.flash('mensajeLogin')
    });
  });
  
  app.post('/login',passport.authenticate('local-login',{
    successRedirect:'/map',
    failureRedirect:'/login',
    failureFlash:true  
  })); 

  

  app.get('/registrar',(req,res) => {
    res.render('registrar',{
      message: req.flash('mensajeRegistro')
    });
  });

  app.post('/registrar',passport.authenticate('local-registro', {
    successRedirect:'/login',
    failureRedirect:'/registrar',
    failureFlash:true

  }));

  app.get('/profile',isLoggedIn,(req,res) => {
    res.render('profile',{
      user:req.user
    });
  });

  app.get('/logout',(req,res) => {
    req.logout();
    res.redirect('/');
  });

  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    return res.redirect('/');
  }

  app.get('/map',isLoggedIn,(req,res)=>{
    res.render('map',{
      user:req.user
    });
  });
}