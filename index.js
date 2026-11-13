console.log('Happy developing ✨')
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const homeRouter = require('./routes/homeRouter');
const expressLayouts = require('express-ejs-layouts');
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('views', __dirname + '/views');
app.set('layout','index')
app.use(express.static(__dirname + '/public'));

app.use('/', homeRouter)

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});