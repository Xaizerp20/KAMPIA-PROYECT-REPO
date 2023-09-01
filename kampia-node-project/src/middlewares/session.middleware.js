import session from 'express-session';

export default function (app) {
    app.use(session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: false
    }));
}