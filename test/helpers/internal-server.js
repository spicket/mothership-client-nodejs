var express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  PORT = 3030;

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

// configure log
app.use(morgan('dev'));

var started = false;
exports.isStarted = function() {
  return started;
};

var server;
process.on('message', function(m) {
    console.log('Server got message:', m);
  if (m === 'start') {
    server = app.listen(PORT, function() {
      started = true;
      return process.send('started');
    });
  } else {
    server.close(function() {
      started = false;
      return process.send('closed') && process.exit(0);
    });
  }
});

app.get('/api/configs/retrieve', (req, res) => {
    
    if (req.get('x-config-key') === 'good-config-key') {
        return res.status(200).send({
            someKey: 'someVal',
            some: {
              sub: {
                key: 'a subkey'
              }
            }
        });
    }
    
    return res.status(404).send({
        error: 'No config was found for the provided key'
    });
    
});