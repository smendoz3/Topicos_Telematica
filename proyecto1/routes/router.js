var express = require('express');
var router = express.Router();
var User = require('../models/user');


// Ruta GET para leer los datos
router.get('/', function (req, res, next) {
  return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//Ruta POST para actualizar los datos
router.post('/', function (req, res, next) {
  //Se confirma que las contraseñas sean iguales
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Las contraseñas no coinciden.');
    err.status = 400;
    res.send("las contraseñas no coinciden");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Usuario o contraseña incorrectos.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Todos los campos deben de estar llenos.');
    err.status = 400;
    return next(err);
  }
})

// ruta GET despues del registro
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Sin autorizacion');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Nombre: </h1>' + user.username + '<h2>Correo: </h2>' + user.email + '<br><a type="button" href="/logout">Salir</a>')
        }
      }
    });
});

// GET para la salida de sesion
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // elimina el objeto de la sesion
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;