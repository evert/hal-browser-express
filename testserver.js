const express = require('express');
const app = express();
const browser = require('./dist/index').default;

app.use(browser());

app.get('/', (req, res) => {

  res.send({
    "_links": {
      "self": { "href":"/testing" },
      "previous": { "href":"/testing/?page=1", "title":"Previous page" },
      "next": { "href":"/testing/?page=2", "title":"Next page" },
      "author": { "href":"https://evertpot.com", "title":"Evert Pot" },
      "help": { "href":"https://google.com/", "title":"Google it" },
      "search": { "href":"https://google.com/{ ?q }", "templated":true },
      "edit": { "href":"/testing" }, "create-form":{ "href":"/testing" },
      "my-link": { "href":"/foo-bar", "title":"Custom link" }
    },
    "msg":"Hello world!",
    "version":"0.3.0",
    "name":"test resource!"
  });

});
app.get('/text', (req, res) => {

  res.type('text/plain');
  res.send('Hello world');

});
app.listen(3000);
