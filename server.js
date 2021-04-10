'use strict';

// application dependencies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
const methodOverride = require('method-override');
const app = express();

// environment variables
const PORT = process.env.PORT || 3030;
const DATABASE_URL = process.env.DATABASE_URL;

// middleware
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//Set the view engine for server-side templating
app.set('view engine', 'ejs');

// database setup
const client = new pg.Client(process.env.DATABASE_URL);

// connect to DB and start the Web Server
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('Connected to database:', client.connectionParameters.database);
        console.log('Server up on', PORT);
    });
});

// routes
app.get('/home', renderHome);
app.get('/herps/api', renderAsAPI);
app.get('/search', handleSearchReq);
app.post('/show', handleShowReq);

// callback functions

function renderAsAPI(req, res) {
    const querySql = 'SELECT * FROM herbs;';

    client.query(querySql).then(result => {

        res.json(result.rows);

    }).catch(error => {
        handleError(error, res);
    });


}

function renderHome(req, res) {
    res.render('pages/index');

}

function handleSearchReq(req, res) {
    res.render('pages/searches/search.ejs');
}

function handleShowReq(req, res) {
    const diseaseName = req.body.disease;
    const url = 'https://herbal-remedy.herokuapp.com/herps/api';

    superagent.get(url).then(resData => {
        return resData.body.filter(herb => {
            if (herb.case_using.includes(diseaseName)) {
                return new Herp(herb);
            }
        });
    }).then(results => {
        res.render('pages/searches/show', { searchResults: results });
    }).catch(error => {
        res.status(500).render('pages/error');
    })
}

// // constructor functions
function Herp(data) {
    this.name = data.name;
    this.image_url = data.image_url;
    this.case_using = data.case_using;
    this.preparation = data.preparation;
    this.description = data.description;
}