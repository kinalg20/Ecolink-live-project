import { Component, Inject, PLATFORM_ID} from '@angular/core';
import { ApiServiceService } from './Services/api-service.service';
import { ConnectionService } from 'ng-connection-service';
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';

// import { Gtag } from 'angular-gtag';
declare const gtag : Function;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  template: `<h1>{{title}}</h1>
    <h3>v{{currentApplicationVersion}}</h3>`
})
export class AppComponent {
  title = 'Ecolink';
  appVersion:any;
  deferredPrompt: any;
  showButton = false;
  addHomeScreenbtn: boolean = true
  isShow: boolean = true;
  topPosToStartShowing = 100;
  GoogleMapAPIKey: string = 'AIzaSyDG8Z4FQOFQ9ddX0INeSaY11MLRTyr-0Xw'
  constructor(private meta : Meta, private _apiService: ApiServiceService, private connectionService: ConnectionService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.router.events.subscribe((event)=>{
      if(event instanceof NavigationEnd){
        //gtag('config','UA-223439069-1', {'page_path': event.urlAfterRedirects});
        if (isPlatformBrowser(this.platformId)) {
          gtag('config', 'UA-223439069-1', { page_path: event.urlAfterRedirects });
        }
      }
    })
    
    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      if (this.isConnected) {
        this.status = "ONLINE";
      }
      else {
        this.status = "OFFLINE";
      }
    })
  }
  ngOnInit() {

    //this.meta.addTag({ name: 'description', content: "test metas." });
    //this._apiService.getPageBySlug('home-page').subscribe(res => {
    //  console.log(res);
    //});
  }
  // public addToHomeScreen(): void {
  //   // hide our user interface that shows our A2HS button
  //   this.showButton = false;
  //   // Show the prompt
  //   this.deferredPrompt.prompt();
  //   // Wait for the user to respond to the prompt
  //   this.deferredPrompt.userChoice
  //     .then((choiceResult: any) => {
  //       if (choiceResult.outcome === 'accepted') {
  //         console.log('User accepted the A2HS prompt');
  //         this.addHomeScreenbtn = false;
  //       } else {
  //         console.log('User dismissed the A2HS prompt');
  //       }
  //       this.deferredPrompt = null;
  //     });
  // }
  status = 'ONLINE';
  isConnected = true;
  // title = 'Demo application for version numbering';
    // currentApplicationVersion = environment.appVersion;
}
