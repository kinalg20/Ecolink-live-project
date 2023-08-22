import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser'; 
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {map, tap} from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private meta : Meta) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    
    return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
          console.log('debugger',event);  
          if(!Array.isArray(event.body.data)) {
            if(event.body?.data?.meta_description)   {
              this.meta.addTag({ name: 'title', content: event.body.data.meta_title});  
              this.meta.updateTag({ name: 'description', content: event.body.data.meta_description });  
            }
          }
          else {
            event.body.data.map((res:any)=>{
              if(res?.meta_description){
                this.meta.addTag({ name: 'title', content: res.meta_title});  
                this.meta.updateTag({ name: 'description', content: res.meta_description });
              }
            })
          }    
      }
      }));
  }
}
