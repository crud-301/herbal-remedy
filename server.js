/* eslint-disable no-unused-vars */
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
const PORT = process.env.PORT || 3000;
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

// callback functions

// constructor functions
