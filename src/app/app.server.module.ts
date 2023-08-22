import { NgModule } from '@angular/core';
import { ServerModule  } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { UniversalInterceptor } from './universal.interceptor';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UniversalInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
