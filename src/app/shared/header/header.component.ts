import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from 'src/app/Services/api-service.service';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FetchedHeaderState } from '../../store/state/header.state';
import { HeaderMenuAction } from '../../store/actions/header.action';
import { HttpErrorResponse } from '@angular/common/http';
import { ViewportScroller } from '@angular/common';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() length: any;
  headerMenuData: any;
  modalcheck: boolean = true;
  user_id: any;
  openMenu: boolean = false;
  openSubmenu: boolean = false;
  opensubSubmenu: boolean = false;
  homePageData: any = [];
  slug: any;
  data: any = []
  responseSubscribe: any = {}
  show: boolean = false;
  searchItem: string = '';
  subslug: any;
  suggestionList: any = [];
  showGlobalSearchSuggestion: any = false;
  customerLocation: string = '';

  @Select(FetchedHeaderState.getFetchedHeader) headerMenu$!: Observable<any>;
  @Select(FetchedHeaderState.getFetchedHeaderLoad) headerMenuDataLoaded$!: Observable<boolean>;
  remembertoken: any;

  constructor(private scroller: ViewportScroller, private route: Router, private activate: ActivatedRoute, private __apiservice: ApiServiceService, private store: Store, private router: Router) { }

  addressArray: any = []
  async ngOnInit() {
    //banner check 
    localStorage.removeItem('modal')
    this.modalcheck = true;
    if (localStorage.getItem('modal')) {
      this.modalcheck = false;
    }
    else {
      this.modalcheck = true;
    }

    let slug = this.activate.snapshot.params;
    console.log(slug);
    if (slug.token) {
      let login_token = localStorage.getItem('email_token');
      if(login_token){
        // console.log(login_token , slug.token == JSON.parse(login_token));     
        login_token = JSON.parse(login_token)
      }
      if (localStorage.getItem('ecolink_user_credential') != null) {
        this.remembertoken = localStorage.getItem('ecolink_user_credential');
        let token = JSON.parse(this.remembertoken);
        if (slug.token == login_token) {
          await this.__apiservice.verifyemail().then((res: any) => {
            if (res) {
              console.log(token.user.flag);
              token.user.flag = 0;   
              console.log(token.user.flag);
              localStorage.setItem('ecolink_user_credential' , JSON.stringify(token));           
              this.router.navigateByUrl('/');
            }
          })
            .catch((error: any) => {
              this.router.navigateByUrl('/profile/auth');
            })
        }
        else {
          this.router.navigateByUrl('/profile/auth');
        }
      }
      else {
        this.router.navigateByUrl('/profile/auth');
      }
    }

    this.getAllHeaderMenu();
    this.headerMenu$.subscribe(res => {
      this.homePageData = [];
      if (res.data) {
        res.data.pages.map((response: any) => {
          this.homePageData.push(response);
        });
      }
    });
    this.cartCountFunction();
    this.getSubscribeMsg();
    if (localStorage.getItem('ecolink_user_credential')) {
      this.__apiservice.checkforuser().then((res: any) => {
        console.log(res);
      })
        .catch((error: any) => {
          setTimeout(() => {
            localStorage.removeItem('ecolink_user_credential');
            this.route.navigateByUrl("/profile");
          }, 5000);
        })
    }

  }

  getSubscribeMsg() {
    this.__apiservice.subscribedmsg.subscribe((res: any) => {
      this.responseSubscribe = res;
    })
  }

  //Get product count from cart 
  cartInfo: any = [];
  async cartCountFunction() {
    console.log(localStorage.getItem('ecolink_user_credential') != null);
    if (localStorage.getItem('ecolink_user_credential') != null) {
      this.__apiservice.GetCart.subscribe(async resp => {
        console.log("resp", resp);
        if (localStorage.getItem('ecolink_user_credential') != null) {
          if (resp?.length == 0 || resp.data?.length == 0) {
            await this.__apiservice.getItemFromCart()
              .then(res => {
                if (res.data) {
                  console.log(res.data);
                  this.length = res.data.length;
                  this.cartInfo = res.data;
                }
              })
              .catch((error: any) => {
                this.length = 0;
                this.cartInfo = [{ string: 'empty' }];
              })
          }

          else {
            if (resp?.string || resp[0]?.string) {
              this.length = 0;
            }
            else if (resp.data) {
              this.length = resp.data.length;
            }
            else {
              this.length = resp.length;
            }
          }
        }
      })

      setTimeout(() => {
        if (this.cartInfo.length > 0) {
          this.__apiservice.GetCart.next(this.cartInfo);
        }
      }, 4000);

    }
    else {
      let cookiesdata = localStorage.getItem("Cookies_Cart_Data");
      if (cookiesdata) {
        let cartsCount = JSON.parse(cookiesdata);
        if (cartsCount.data.length > 0) {
          this.length = cartsCount.data.length;
        }

        else {
          this.length = 0;
        }
      }

      else {
        this.length = 0;
      }
    }
  }
  //Go to profile page if user signed in
  profile() {
    if (localStorage.getItem("ecolink_user_credential") === null) {
      this.route.navigateByUrl('/profile/auth');
    }
    else {
      this.__apiservice.toggleButton.next({});
      this.route.navigateByUrl('/profile');
    }
  }
  //open dropdown in mobile screen
  openmenu() {
    this.openMenu = !this.openMenu;
  }
  openDropDown() {
    this.openSubmenu = !this.openSubmenu
  }
  opensubDropDown() {
    console.log('subcategory')
    this.opensubSubmenu = !this.opensubSubmenu
  }
  //Suggestion when user search dynamically
  getSuggestion(data: any) {
    this.showGlobalSearchSuggestion = false;
    this.slug = data.category.slug;
    this.subslug = data.slug;
    this.searchItem = data.name;
  }


  //Global search function
  globalSearch() {
    console.log(this.searchItem);
    if (this.searchItem.length > 0) {
      this.suggestionList = [];
      this.__apiservice.globalSearchData(this.searchItem).subscribe(
        (res: any) => {
          this.showGlobalSearchSuggestion = true;
          this.suggestionList = res.data;
        },
        (error: HttpErrorResponse) => {
          if (error.error.code == 400) {
            this.showGlobalSearchSuggestion = true;
            let data = [
              {
                name: "No Data Found"
              }
            ]
            this.suggestionList = data;
          }
        }
      )
    }

    else {
      this.showGlobalSearchSuggestion = false;
    }

  }

  userName: string = '';
  userDetail: any;
  getAllHeaderMenu() {
    this.headerMenuData = this.headerMenuDataLoaded$.subscribe(res => {
      if (!res) {
        this.store.dispatch(new HeaderMenuAction());
      }
    })

    this.userDetail = localStorage.getItem('ecolink_user_credential');
    if (this.userDetail) {
      let name = JSON.parse(this.userDetail);
      console.log(name.user.name.split(" ")[0]);
      if (name.user.flag == 0) {
        this.userName = name.user.name.split(" ")[0];
        console.log(this.userName);
      }
      else {
        this.userName = '';
        localStorage.removeItem('usernameforheader')
      }
    }
  }
  //Route on Same page for header link in mobile view
  routeOnSamePage(slug: any, sublink?: any, subsublink?: any) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    if (subsublink) {
      this.router.navigate(['/' + slug + '/' + sublink + '/' + subsublink]);
    }
    else if (sublink) {
      this.router.navigate(['/' + slug + '/' + sublink]);
    }

    else {
      this.router.navigate(['/' + slug]);
    }
  }

  //close subscribe mail popup 
  closeButton() {
    let object = {
      resSignupMsg: '',
      resSignupMsgCheck: '',
    }

    this.__apiservice.subscribedmsg.next(Object.assign({}, object));

  }
  //scroll down to up function
  scrollup(event: any) {
    console.log(event);
    this.responseSubscribe = event;
    this.scroller.scrollToAnchor('subscribeMsg');
  }
  closeModalEvent(event: any) {
    this.modalcheck = event;
    console.log(event);
  }

  //for not repeating api calling
  ngOnDestroy() {
    // this.headerMenuData.unsubscribe();   
  }
}