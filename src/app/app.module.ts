import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { ProductCartComponent } from './product-cart/product-cart.component';
import { ApiServiceService } from './Services/api-service.service';
import { SharedModule } from './shared/shared.module';
import { SharelibraryModule } from './sharelibrary/sharelibrary.module';
import { FetchedHeaderState } from './store/state/header.state';
import { environment } from 'src/environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CommonModule } from "@angular/common";
import { FetchedCategoriesState } from './store/state/category.state';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './auth.interceptor';
import { GtagModule } from 'angular-gtag';
import {NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule} from 'ngx-google-analytics'
import { UniversalInterceptor } from './universal.interceptor';
import { TransferHttpCacheModule } from '@nguniversal/common';

@NgModule({
  declarations: [
    AppComponent,
    ProductCartComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    SharelibraryModule,
    CommonModule,
    ToastrModule.forRoot(),
    NgxsModule.forRoot([FetchedHeaderState, FetchedCategoriesState], { developmentMode: !environment.production }),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    GtagModule.forRoot({ trackingId: 'UA-YOUR_TRACKING_ID', trackPageviews: true }),
    ServiceWorkerModule.register('ngsw-worker.js', {
     enabled: environment.production,
     // Register the ServiceWorker as soon as the application is stable
     // or after 30 seconds (whichever comes first).
     registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule,
    NgxGoogleAnalyticsModule.forRoot('UA-223439069-1'),
    NgxGoogleAnalyticsRouterModule
  ],
  providers: [ApiServiceService, AuthGuard , 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UniversalInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

  
}
