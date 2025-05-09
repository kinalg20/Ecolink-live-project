(global as any).WebSocket = require('ws');
(global as any).XMLHttpRequest = require('xhr2');

import 'zone.js/dist/zone-node';
import 'localstorage-polyfill';

import {APP_BASE_HREF} from '@angular/common';
import {ngExpressEngine} from '@nguniversal/express-engine';
import * as express from 'express';
import {existsSync} from 'fs';
import { join } from 'path';

const domino = require('domino');
const fs = require('fs');
const path = require('path');

const distFolder = join(process.cwd(), 'dist/Ecolink/browser');
//const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
const template = fs.readFileSync(path.join(distFolder, 'index.html')).toString();
const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
const win = domino.createWindow(template.toString());

//const { AppServerModuleNgFactory } =
//    require('dist/Ecolink/server/main.bundle');

global['window'] = win;
global['document'] = win.document;
global['self'] = win
global['IDBIndex'] = win.IDBIndex
global['document'] = win.document
global['navigator'] = win.navigator
global['getComputedStyle'] = win.getComputedStyle;
global['localStorage'] = localStorage;

import {AppServerModule} from './src/main.server';
import { renderModuleFactory } from '@angular/platform-server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {

  

  const server = express();
  




  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
    server.set('views', distFolder);

    //server.route('*').get((req, res) => {
    //    renderModuleFactory(AppServerModuleNgFactory, {
    //        document: indexHtml,
    //        url: req.url
    //    })
    //        .then((html) => res.status(200).send(html))
    //        .catch(err => {
    //            console.log(err);
    //            res.sendStatus(500);
    //        });
    //});


  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
    server.get('*', (req, res, next) => {
        if (req.url.includes('/api')) return next();
      res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4200;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
