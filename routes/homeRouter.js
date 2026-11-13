const router = require('express').Router();
const HomeController = require('../controllers/HomeController');
const timeTracker=require('../models/timeTracker');

router.use(HomeController.loadUser);

router.get('/',HomeController.getHomePage);
router.get('/about',HomeController.getAboutPage);
router.get('/register',HomeController.getRegisterPage);
router.get('/login',HomeController.getLoginPage);
router.get('/logout',HomeController.logout);
router.get('/database',HomeController.verify, HomeController.getDatabasePage);

router.post('/login',HomeController.login);
router.post('/register',HomeController.register);

router.post('/tasks', timeTracker.createNewTask, HomeController.getHomePage);
router.post('/tasks/:id/start',timeTracker.startTimer, HomeController.getHomePage);
router.post('/tasks/:id/stop',timeTracker.stopTimer, HomeController.getHomePage);
router.post('/tasks/:id/delete',timeTracker.deleteTask, HomeController.getHomePage);
module.exports=router;