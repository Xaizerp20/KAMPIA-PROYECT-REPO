

export default function (app){
    app.use(function(req, res, next) {
        if (!req.session.user_id && req.path !== '/login') {
            console.log('You must login');
            res.redirect('/login');
        } else {
          next();
        }
      });
}


