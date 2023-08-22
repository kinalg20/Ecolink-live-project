import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { Request } from 'express';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { isPlatformServer } from '@angular/common';

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {

  constructor(@Inject(PLATFORM_ID) private platformId: any, @Optional() @Inject(REQUEST) protected serverRequest: Request) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let serverReq: HttpRequest<unknown> = request;
    console.log('sid', request.url);
    //if (this.request) {
    //  let newUrl = `${this.request.protocol}://${this.request.get('host')}`;
    //  if (!request.url.startsWith('/')) {
    //    newUrl += '/';
    //  }
    //  newUrl += request.url;
    //  serverReq = request.clone({ url: newUrl });
    //}

    //if (isPlatformServer(this.platformId)) {
    //  if (request.method === 'GET') {
    //    const requestUrl = request.url.replace(/^\./, '');
    //    if (this.serverRequest && !(requestUrl.startsWith('http') || requestUrl.startsWith('//'))) {
    //      const protocolHost = `${this.serverRequest.protocol}://${this.serverRequest.get('host')}`;
    //      const pathSeparator = !requestUrl.startsWith('/') ? '/' : '';
    //      const url = protocolHost + pathSeparator + requestUrl;
    //      request = request.clone({ url });
    //    }
    //  } else {
    //    return EMPTY; // return all call except GET method
    //  }
    //}
    return next.handle(serverReq);
  }
}
