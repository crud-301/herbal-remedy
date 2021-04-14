'use strict';

// Application dependencies

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

const methodOverride = require('method-override');
const app = express();

// Environment variables
const PORT = process.env.PORT || 3030;
const DATABASE_URL = process.env.DATABASE_URL;
const PASS = process.env.PASS;

// Middleware
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//Set the view engine for server-side templating
app.set('view engine', 'ejs');

// Database setup
const client = new pg.Client(process.env.DATABASE_URL);

// Connect to DB and start the Web Server
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('Connected to database:', client.connectionParameters.database);
    console.log('Server up on', PORT);
  });
});

// Routes
app.get('/home', renderHome);
app.get('/herps/api', renderAsAPI);
app.get('/search', handleSearchReq);
app.post('/show', handleShowReq);
app.get('/', renderHome);
app.get('/about', handleAbout);
app.get('/herps/api', renderAsAPI);
app.get('/search', handleSearchReq);
app.post('/show', handleShowReq);
app.post('/collection', addHerbToDB);
app.get('/collection', renderCollectionPageFromDb);

app.get('/collection/:id', getOneHerb);
app.put('/collection/:id', updateDetails);
app.delete('/collection/:id', deleteDetails);

app.get('/dashboard',checkDashboardPassword );
app.post('/dashboard/open', getUserSuggestions);
app.put('/dashboard/:id', updateSuggestionTable);
app.delete('/suggestion/delete/:id', deleteFromSuggestionTable);


// Callback Functions

function getUserSuggestions(req, res) {
  const pass = req.body.password;
  const getQuery = 'SELECT * FROM add_suggestions;';
  client.query(getQuery).then(result => {
    if(pass === PASS) {

      res.render('pages/dashboard', {results: result.rows } );
    }else {
      res.render('pages/loginDash');
    }
  });
}


function renderAsAPI(req, res) {
  const querySql = 'SELECT * FROM herbs;';
  
  client.query(querySql).then(result => {
    res.json(result.rows);
  }).catch(error => {
    errorPage(error, res)
  });
}

function renderHome(req, res) {
  const apiUrl = 'https://herbal-remedy.herokuapp.com/herps/api';
  
  const updateQuery = `SELECT * FROM add_herb INNER JOIN(SELECT name FROM add_herb GROUP BY name HAVING COUNT(id) >2
  ) temp ON add_herb.name= temp.name;`;
  client.query(updateQuery).then((result) => {
    if (result.rows < 3) {
      superagent.get(apiUrl).then(results => {
        res.render('pages/index', { result: results.body });
      });
    } else {
      res.render('pages/index', { result: result.rows });
    }
  }).catch(error => {
    errorPage(error, res)
  });
}

function renderCollectionPageFromDb(req, res) {
  const sqlQuery = `SELECT DISTINCT image_url, id, name, case_using, preparation, description FROM add_herb;`;
  
  client.query(sqlQuery).then(result => {
    res.render('pages/collection', { result: result.rows });
  }).catch(error => {
    errorPage(error, res)
  });
}

function addHerbToDB(req, res) {
  const { name, image_url, case_using, preparation, description } = req.body;
  const insertQuery = `INSERT INTO add_herb(name, image_url, case_using, preparation, description) VALUES ($1, $2, $3, $4, $5) ;`;
  const safeValues = [name, image_url, case_using, preparation, description];
  client.query(insertQuery, safeValues).then(() => {
    res.redirect('/collection');
  }).catch(error => {
    errorPage(error, res)
  });
}

function getOneHerb(req, res) {
  const herbId = req.params.id;
  const saveHerb = [herbId];
  const sqlHerb = 'SELECT * FROM add_herb WHERE id=$1';
  client.query(sqlHerb, saveHerb).then(herbs => {
    res.render('pages/herbs/details.ejs', { herb: herbs.rows[0] });
  }).catch(error => {
    errorPage(error, res)
  })
}
  
function updateDetails(req, res) {
    const idParam = req.params.id;
    const { name,image_url, case_using, preparation, description} = req.body;
    const saveValus = [name, image_url, case_using, preparation, description ];
    const insertQuery = 'INSERT INTO add_suggestions (name, image_url, case_using, preparation, description) Values($1, $2, $3, $4, $5);';
    client.query(insertQuery, saveValus).then(() => {
      res.redirect(`/collection/${idParam}`);
    }).catch(error => {
      errorPage(error, res)
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
      errorPage(error, res)
    });
}
  
function deleteDetails(req, res) {
    const herbID = req.params.id;
    const deleteQuery = 'DELETE FROM add_herb WHERE id=$1;';
    const saveValus = [herbID];
    client.query(deleteQuery, saveValus).then(() => {
      res.redirect('/collection');
    }).catch(error => {
      errorPage(error, res)
    });
    
}
  
function handleAbout(req, res) {
    res.render('pages/about');
  }
  
function checkDashboardPassword(req, res) {

  res.render('pages/loginDash', { PASS : PASS });
  }


  app.get('/suggestion/delete/:id', checkDelete);

  function checkDelete(req, res){
    const herbId = req.params.id;
  
    const safeVal = [herbId];
    const updateQuery = 'SELECT * FROM add_suggestions WHERE id=$1;';
  
    client.query(updateQuery, safeVal).then(results => {
      results.rows.forEach(element => {
        // const saveValus = [element.name, element.image_url, element.case_using, element.preparation, element.description, element.name ];
        // const updateQ = `UPDATE add_herb SET name=$1, image_url=$2, case_using=$3, preparation=$4, description=$5 WHERE name=$6;`;
  
        const saveValues= [element.name];
        const deleteQ = 'DELETE FROM add_suggestions WHERE name=$1;';
        client.query(deleteQ, saveValues).then(() => {
          res.redirect('/collection');
        });
      });
    });
  }
  


app.get('/suggestion/delete/:id', checkDelete);

function checkDelete(req, res){
  const herbId = req.params.id;

  const safeVal = [herbId];
  const updateQuery = 'SELECT * FROM add_suggestions WHERE id=$1;';

  client.query(updateQuery, safeVal).then(results => {
    results.rows.forEach(element => {
      // const saveValus = [element.name, element.image_url, element.case_using, element.preparation, element.description, element.name ];
      // const updateQ = `UPDATE add_herb SET name=$1, image_url=$2, case_using=$3, preparation=$4, description=$5 WHERE name=$6;`;

      const saveValues= [element.name];
      const deleteQ = 'DELETE FROM add_suggestions WHERE name=$1;';
      client.query(deleteQ, saveValues).then(() => {
        res.redirect('/collection');
      });
    });
  });
}

function updateSuggestionTable(req, res) {
  const herbId = req.params.id;

  const updateQuery = 'SELECT * FROM add_suggestions WHERE id=$1;';
  const safeVal = [herbId];

  client.query(updateQuery, safeVal).then(results => {
    results.rows.forEach(element => {
      const saveValus = [element.name, element.image_url, element.case_using, element.preparation, element.description, element.name ];
      const updateQ = `UPDATE add_herb SET name=$1, image_url=$2, case_using=$3, preparation=$4, description=$5 WHERE name=$6;`;
      // const insertQuery = 'INSERT INTO add_herb (name, image_url, case_using, preparation, description) Values($1, $2, $3, $4, $5);';
console.log(element.id)
      client.query(updateQ, saveValus ).then(() => {
        res.redirect(`/suggestion/delete/${element.id}`);
      });
  
  
    });
  }
  
function deleteFromSuggestionTable(req, res) {
  const herbId = req.params.id;
  const deleteQuery = `DELETE FROM add_suggestions WHERE id=$1;`;
  const safeValues = [herbId];
  
  client.query(deleteQuery, safeValues).then(() => {
    res.render('pages/dashboard');
  }).catch(error => {
    errorPage(error, res)
  })
}

function getUserSuggestions(req, res) {
  const pass = req.body.password
  const getQuery = 'SELECT * FROM add_suggestions;';
  client.query(getQuery).then(result => {
    if(pass === PASS) {

      res.render('pages/dashboard', {results: result.rows } )
    }else {
      res.render('pages/loginDash')
    }
  }).catch(error => {
    errorPage(error, res)
  })
}

// Constructor Functions

function Herp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.case_using = data.case_using;
  this.preparation = data.preparation;
  this.description = data.description;
}

function errorPage(error, res) {
  res.render('pages/error', {error:error})
}