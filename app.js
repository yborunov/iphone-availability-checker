import request from 'request'
import express from 'express'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

const parts = [
  { id: 'MN4V2VC/A', name: 'iPhone 7 Plus 128Gb Jet Black' },
  { id: 'MN4M2VC/A', name: 'iPhone 7 Plus 128Gb Black' },
  { id: 'MN4P2VC/A', name: 'iPhone 7 Plus 128Gb Silver' },
  { id: 'MN962VC/A', name: 'iPhone 7 128Gb Jet Black' },
  { id: 'MN922VC/A', name: 'iPhone 7 128Gb Black' },
  { id: 'MN932VC/A', name: 'iPhone 7 128Gb Silver' }
]

const POSTAL_CODE = '';

let getUrl = (part, postalCode) => {
  return 'http://www.apple.com/ca/shop/retail/pickup-message?parts.0=' + part + '&location=' + postalCode + '&little=true';
}

const app = express()

app.set('port', (process.env.PORT || 3000))

const View = ({ models }) => {
  return <div>
      {models.map((model, i) => {
        return <div key={i}>
          <h1>{model.name}</h1>
          {!model.stores.length ? 
            <p>Not available</p>
            : 
            <ul>
              {model.stores.map((store, i) => {
                return <li key={i}><b>{store.storeName}</b> ({Object.keys(store.address).map(key => store.address[key]).filter((addr) => addr !== null).join(', ')})</li>
              })}
            </ul>
          }
        </div>
      })}
  </div>
}

export default () => {

  app.listen(app.get('port'), () => {
    console.log('The app is listening on port ' + app.get('port') + '!')
  })


  app.get('/', (req, res) => {

    var promises = parts.map(function (part) {
      return new Promise(function (resolve, reject) {
          request(getUrl(part.id, POSTAL_CODE), function (error, response, body) {
          if (!error && response.statusCode === 200) {
            var json = JSON.parse(body);

            if (!json.body.stores) {
              reject(response, 'Wrong response');
              return;
            }

            var found = json.body.stores.filter(function (store) {
              return store.partsAvailability[part.id].storeSelectionEnabled;
            });

            resolve({
              id: part.id,
              name: part.name, 
              stores: found
            });

          } else {
            reject(response);
          }
        });
      });
    });


    Promise.all(promises).then(function (models) {
      res.send(ReactDOMServer.renderToString(<View models={models} />))
    });
  });
}
