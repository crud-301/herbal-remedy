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
app.get('/', renderHome);
app.get('/about', handleAbout)
app.get('/herps/api', renderAsAPI);
app.get('/search', handleSearchReq);
app.post('/show', handleShowReq);
app.post('/collection', addHerbToDB);
app.get('/collection', renderCollectionPageFromDb);
app.get('/collection/:id', getOneHerb);
app.put('/collection/:id', updateDetails);
app.delete('/collection/:id', deleteDetails);


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
    const apiUrl = 'https://herbal-remedy.herokuapp.com/herps/api';

    const updateQuery = `SELECT * FROM add_herb INNER JOIN(SELECT name FROM add_herb GROUP BY name HAVING COUNT(id) >2
  ) temp ON add_herb.name= temp.name;`
    client.query(updateQuery).then((result) => {
        if (result.rows < 3) {
            superagent.get(apiUrl).then(results => {
                res.render('pages/index', { result: results.body });
            })
        } else {
            res.render('pages/index', { result: result.rows })
        }
    });
}


function renderCollectionPageFromDb(req, res) {
    const sqlQuery = `SELECT DISTINCT image_url, id, name, case_using, preparation, description FROM add_herb;`;

    client.query(sqlQuery).then(result => {
        res.render('pages/collection', { result: result.rows });
    }).catch(error => {
        handleError(error, res);
    });
}

function addHerbToDB(req, res) {
    const { name, image_url, case_using, preparation, description } = req.body;
    const insertQuery = `INSERT INTO add_herb(name, image_url, case_using, preparation, description) VALUES ($1, $2, $3, $4, $5) ;`;
    const safeValues = [name, image_url, case_using, preparation, description];
    client.query(insertQuery, safeValues).then(() => {
        res.redirect('/collection');
    });
}


function getOneHerb(req, res) {
    const herbId = req.params.id;
    const saveHerb = [herbId];
    const sqlHerb = 'SELECT * FROM add_herb WHERE id=$1';
    client.query(sqlHerb, saveHerb).then(herbs => {
        res.render('pages/herbs/details.ejs', { herb: herbs.rows[0] });
    }).catch(error =>
        handleError(error, res));
}

function updateDetails(req, res) {
    const idParam = req.params.id;
    const { name, case_using, preparation, description, image_url } = req.body;
    const saveValus = [name, case_using, preparation, description, image_url, idParam];
    const updatSql = `UPDATE add_herb SET name=$1, case_using=$2, preparation=$3, description=$4, image_url=$5 WHERE id=$6;`;
    client.query(updatSql, saveValus).then(() => {
        res.redirect(`/collection/${idParam}`);
    });
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
    });
}

function deleteDetails(req, res) {
    const herbID = req.params.id;
    const deleteQuery = 'DELETE FROM add_herb WHERE id=$1;';
    const saveValus = [herbID];
    client.query(deleteQuery, saveValus).then(() => {
        res.redirect('/collection');
    });

}

function handleAbout(req, res) {
    res.render('pages/about');
}
// constructor functions
function Herp(data) {
    this.name = data.name;
    this.image_url = data.image_url;
    this.case_using = data.case_using;
    this.preparation = data.preparation;
    this.description = data.description;
}