//const bcrypt = require('bcrypt');
//const prisma = require('../prismaClient');
const jwt = require('jsonwebtoken');
const {tasks}=require('../models/timeTracker');

module.exports = {
    loadUser: (req, res, next) => {
        const token = req.cookies.accessToken;
        if (!token) {
            res.locals.user = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, "your_jwt_secret_key"); //process.env.JWT_SECRET
            req.user = decoded;
            res.locals.user = decoded;
            return next();
        } catch (error) {
            if (!(error instanceof jwt.JsonWebTokenError)) {
                return next(error);
            }
            res.clearCookie('accessToken', { path: '/' });
            res.locals.user = null;
            return next();
        }
    },
    verify: (req, res, next) => {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).send('Access denied. No token provided.');
        }
        try {
            const decoded = jwt.verify(token, "your_jwt_secret_key");
            req.user = decoded;
            res.locals.user = decoded;
            next();
        } catch (error) {
            return res.status(400).send('Invalid token.');
        }
    },
    getHomePage: (req, res) => {
        let currentUserEmail = req.cookies.currentUserEmail || null;
        res.render('home',{currentUserEmail});
    },
    getAboutPage: (req, res) => {
      res.render('about');
    },
    getRegisterPage: (req, res) => {
        res.render('register');
    },
    getLoginPage:(req, res) => {
        res.render('login');
    },
    getDatabasePage: async (req, res) => {
        // const users = await prisma.user.findMany({
        //     select: { id: true, name: true, email: true, createdAt: true },
        //     orderBy: { createdAt: 'asc' }
        // });

        let users = JSON.parse(req.cookies.users || '[]');
        res.render('database', { users });
    },

    register: async (req, res) => {
        const { email, password, confirmPassword } = req.body;
        if (!email || !password || !confirmPassword) {
            return res.status(400).send('All fields are required');
        }
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }

        //const passwordHash = await bcrypt.hash(password, 12);
        const randomId = crypto.randomUUID();
        // let user;
        // try {
        //     user = await prisma.user.create({
        //         data: {
        //             email,
        //             passwordHash
        //         },
        //         select:{
        //             id: true,
        //         }
        //     });
        // } catch (error) {
        //     if (error.code === 'P2002') {
        //         return res.status(409).send('An account with this email already exists');
        //     }
        //     throw error;
        // }

        let users = JSON.parse(req.cookies.users || '[]');
        users.push({ email, password, createdAt: new Date().toISOString() });
        res.cookie('users', JSON.stringify(users), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });
        const token = jwt.sign({ userId: email }, "your_jwt_secret_key", { expiresIn: '1h' });

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });
        res.cookie('currentUserEmail', email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });
        return res.redirect('/');
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        // const user = await prisma.user.findUnique({ where: { email } });
        // if (!user) {
        //     return res.status(401).send('Invalid email or password');
        // }

        // const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        // if (!isPasswordValid) {
        //     return res.status(401).send('Invalid email or password');
        // }
        const users = JSON.parse(req.cookies.users || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }
        const token = jwt.sign({ userId: email }, "your_jwt_secret_key", { expiresIn: '1h' });

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });
        res.cookie('currentUserEmail', email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });

        return res.redirect('/');
    },
    logout: (req, res) => {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('currentUserEmail', { path: '/' });
        return res.redirect('/');
    }
};