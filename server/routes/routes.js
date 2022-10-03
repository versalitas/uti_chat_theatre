const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/director',  (req,res) =>  {
    console.log(__dirname);
    res.sendFile(path.join(__dirname, '../client/public/index.html'), function(err) {
      if (err) res.status(404).send(err)
    })
  });
  
  router.get('/show', (req,res) =>  {
    res.sendFile(path.join(__dirname, '../client/public/index.html'), function(err) {
      if (err) res.status(404).send(err)
    })
  });
  
router.get('/', (req,res) =>  {
    res.sendFile(path.join(__dirname, '../client/public/index.html'), function(err) {
      if (err) res.status(404).send(err)
    })
  });

  module.exports = router;