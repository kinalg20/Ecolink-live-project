import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ApiServiceService } from 'src/app/Services/api-service.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-product-cart',
  templateUrl: './product-cart.component.html',
  styleUrls: ['./product-cart.component.scss']
})
export class ProductCartComponent implements OnInit {
  CardShow: any = [];
  certfee: any = 0
  CERTvalue: boolean = false
  totalqty: number = 0
  imageurl = environment.assetsurl;
  liftservice: any = [];
  length: any = 0
  SubTotal: number = 0;
  UserLogin: any;
  CartShimmer: boolean = true;
  cartUpdated: boolean = false;
  lift_gate_charge: number = 0;
  constructor(private _ApiService: ApiServiceService, private route: Router, private store: Store, private meta: Meta) { }
  async ngOnInit() {
    this.meta.updateTag({ name: 'description', content: "sid meta tags." });
    this.UserLogin = localStorage.getItem('ecolink_user_credential');
    await this.getStaticData();
    await this.getCartData();
    if (!this.UserLogin) {
      let LiftGateServiceCharges = localStorage.getItem('Lift_Gate_Charge_Guest_User');
      if (LiftGateServiceCharges) {
        let ServiceCharge = JSON.parse(LiftGateServiceCharges);
        console.log(ServiceCharge);
        if (ServiceCharge) {
          this.checked = true;
        }
      }
    }

    else {
      let LiftGateServiceCharges = localStorage.getItem('Lift_Gate_Charge_User');
      if (LiftGateServiceCharges) {
        let ServiceCharge = JSON.parse(LiftGateServiceCharges);
        console.log(ServiceCharge);
        if (ServiceCharge > 0) {
          this.checked = true;
        }
      }

    }

    if(!this.UserLogin){
      let CertFee = localStorage.getItem("CERT_Value_Guest_User");
      if (CertFee) {
        let ServiceCharge = JSON.parse(CertFee);
        console.log(ServiceCharge);
        if (ServiceCharge) {
          this.CERTvalue = true;
          this.CERTFeeAmount = this.certfee;
        }
      }
    }
    else {
      let CertFee = localStorage.getItem("CERT_Value_User");
      if (CertFee) {
        let ServiceCharge = JSON.parse(CertFee);
        console.log(ServiceCharge);
        if (ServiceCharge) {
          this.CERTvalue = true;
          this.CERTFeeAmount = this.certfee;
        }
      }
    }
  }



  //get products which added in cart
  cartInfo: any = [];
  localCookies: any;
  async getCartData() {
    let data_object: any = {}
    if (this.UserLogin === null) {
      this._ApiService.GetCart.subscribe(res => {
        console.log(res.data);
        if (res.data?.length > 0) {
          console.log(res);
          this.CardShow = res.data;
          this.subtotal();
          this.CartShimmer = false;
          this.length = this.CardShow.length;
        }

        else {
          this.localCookies = localStorage.getItem("Cookies_Cart_Data");
          if (this.localCookies) {
            let cookieData = JSON.parse(this.localCookies);
            console.log(cookieData);

            if (cookieData.data?.length > 0) {
              console.log("cookieData", cookieData);
              this.CardShow = cookieData.data;
              this.subtotal();
              this.CartShimmer = false;
              this.length = this.CardShow.length;
            }

            else {
              this.CardShow = [];
              this.CartShimmer = false;
              localStorage.setItem('Lift Gate Charge', '0')
            }
          }

          else {
            this.CardShow = [];
            this.CartShimmer = false;
            // this.checked=false;
            // this.liftcharges=0

          }

        }

      })

      data_object.data = this.CardShow;
      this._ApiService.GetCart.next(data_object);


    }
    else {
      // debugger
      this._ApiService.GetCart.subscribe(async (res) => {
        console.log(res);
        if (res?.length > 0) {
          if (res.string || res[0].string) {
            console.log("empty block");
            this.CardShow = [];
            this.length = this.CardShow.length;
            this.totalqty = 0;
            res?.map((response: any) => {
              this.totalqty += response.quantity;
              console.log(this.totalqty, response.quantity)
            })
            this.CartShimmer = false;
            this.cartUpdated = false;
          }
          else if (!res.string || !res[0].string) {
            console.log("not empty");
            this.CardShow = res;
            this.CartShimmer = false;
            this.cartUpdated = false;
            this.subtotal();
            this.length = this.CardShow.length;
            if (res.data) {
              this.CardShow = res.data;
              this.CartShimmer = false;
              this.cartUpdated = false;
              this.subtotal();
              this.length = this.CardShow.length;
            }
          }
        }
        else if (res?.length == 0) {
          await this._ApiService.getItemFromCart()
            .then((resp) => {
              console.log("API block");
              resp.liftcharges = false;
              this.cartInfo = resp.data;
              this.CardShow = resp.data;
              this.subtotal();
              this.CartShimmer = false;
              this.cartUpdated = false;
              this.totalqty = 0;
              // resp.map((response: any) => {
              //   this.totalqty += response.quantity;
              //   console.log(this.totalqty, response.quantity)
              // })
            })

            .catch((error) => {
              console.log("API catch block");
              this.CardShow = [];
              this.subtotal();
              this.CartShimmer = false;
              this.cartUpdated = false;
              this.cartInfo = [{ string: 'empty' }];
              // this.totalqty += 0;
            })
        }
      });
      setTimeout(() => {
        if (this.cartInfo.length > 0) {
          this._ApiService.GetCart.next(this.cartInfo);
          this.cartUpdated = false;
        }
      }, 6000);
      this.cartUpdated = false;
    }
  }

  hazardousAmount: any = 0;
  getLiftTotalCharge() {
    this.Total = 0;
    this.hazardousAmount = 0;
    this.CardShow.map((res: any) => {   
      if (res.product.hazardous == 1) {
        this.hazardousAmount = this.hazardous;
      }
      this.Total = this.Total + (res.product.sale_price * res.quantity);
      console.log("this.Total", this.Total);
      console.log(this.hazardousAmount);
    })
  }
  //get total amount of all product
  Total: any = 0;
  LiftGateService: any = 0;
  subtotal() {
    console.log("Subtotal Block", this.CardShow);
    this.SubTotal = 0;
    this.Total = 0;
    this.CardShow.map((res: any) => {
      console.log(res.product.sale_price);
      this.SubTotal = this.SubTotal + res.product.sale_price * res.quantity;
    })
    this.getLiftTotalCharge();
  }

  //increase and decrease product quantity for non logged in user
  Count(string: any, id: any) {
    if (string == "add") {
      if (this.CardShow[id].quantity <= 24) {
        this.CardShow[id].quantity = this.CardShow[id].quantity + 1;
        this.subtotal();
      }
    }
    if (string == "delete") {
      if (this.CardShow[id].quantity >= 2) {
        this.CardShow[id].quantity = this.CardShow[id].quantity - 1;
        this.subtotal();
      }
    }
  }


  //update cart item in local storage for non logged in and api call for logged in
  ItemCart: any;
  ItemIncrease: boolean = false;
  async UpdateCart(action: any, product_id: any, product_quantity: any, rowIndex: any, lift_gate: any) {
    this.liftservice = [];
    // this.liftcharges = 0
    if (this.UserLogin === null) {
      this.CartShimmer = true;
      this.Count(action, rowIndex);
      let cookiesObject: any = {};
      console.log(this.CardShow, product_quantity, "CardShow");
      this.CartShimmer = false;
      cookiesObject.data = this.CardShow;
      localStorage.setItem("Cookies_Cart_Data", JSON.stringify(cookiesObject));
      if (this.CardShow.length == 0) {
        localStorage.setItem('CERT Value', '0');
      }
      this.subtotal();
    }
    else {
      this.cartUpdated = true;
      if (action == 'delete') {
        this.ItemCart = await this._ApiService.addItemToCart(product_id, 1, action, lift_gate)
          .then((res) => {
            return res;
          })
          .catch(error => {
            console.log(error);
            if (error.status == 400) {
              this.cartUpdated = false;
            }
          })

        if (this.ItemCart) {
          this._ApiService.GetCart.next(this.ItemCart.data);
          this.subtotal();
        }
        else {
          this._ApiService.GetCart.next([]);
        }
      }

      else if (action == 'add') {
        this.ItemCart = await this._ApiService.addItemToCart(product_id, 1, action, lift_gate)
          .then((res) => {
            return res;
          })

        if (this.ItemCart) {
          this._ApiService.GetCart.next(this.ItemCart.data);
          this.subtotal();
        }

        else {
          // this._ApiService.GetCart.next([]);
          this.cartUpdated = false;
        }
      }
      else {
        this.getCartData();
        this.subtotal();
      }
      this.cartUpdated = false;
    }
  }

  //delete cart item from local storage for non logged in and api call for logged in
  cookies_data: any = [];
  local_data: any = [];
  async deleteItemFromCart(product: any) {
    this.liftservice = [];
    // this.liftcharges = 0
    let CartData: any = {};
    if (this.UserLogin != null) {
      this.cartUpdated = true;
      this.ItemCart = await this._ApiService.deleteItemFromCart(product.product.id)
        .then((res) => {
          if (res.code == 200) {
            console.log(res);
            this.CardShow = res.data;
            if (res.data?.length == 0) {
              this.CardShow = [];
              this.length = this.CardShow.length;
              localStorage.setItem('Lift_Gate_Charge_User', 'false')
              localStorage.setItem('CERT_Value_User', 'false');
            }
            this.cartUpdated = false;
            return res.data;
          }
        })
        .catch((error) => {
          this.CardShow = [];
          this.length = this.CardShow.length;
          this.cartUpdated = false;
          localStorage.setItem('CERT_Value_User', 'false');
        })
    }
    else {
      this.CartShimmer = true;
      this.CardShow.map((res: any, index: any) => {
        console.log(res.product_id, product.product_id);
        if (res) {
          if (res.product_id == product.product_id) {
            this.CardShow.splice(index, 1)
          }
        }
      })
      this.CartShimmer = false;
      console.log(this.CardShow.length);
      CartData.data = this.CardShow;
      this.length = this.CardShow?.length;
      console.log("length", length);
      localStorage.setItem("Cookies_Cart_Data", JSON.stringify(CartData));
    }


    if (this.ItemCart?.length > 0) {
      this._ApiService.GetCart.next(this.ItemCart);
    }

    else {
      console.log("empty");
      this._ApiService.GetCart.next([{ string: 'empty' }]);
    }


    this.getLiftTotalCharge();

  }

  //Calculate Service Charges
  liftcharges: any = 0
  getservicevalue(event: any, product_id: any) {
    let data: any = {};
    console.log("User Logged in", event);
    if (this.UserLogin) {
      this.CardShow.map((res: any) => {
        if (res.product_id == product_id) {
          res.lift_gate = res.lift_gate == 0 ? 1 : 0;
          console.log(res.lift_gate);
          if (res.lift_gate == 0) {
            res.lift_gate = 1;
          }
          else {
            res.lift_gate = 0;
          }
          console.log(res.lift_gate);
          this._ApiService.addItemToCart(product_id, 0, "add", res.lift_gate);
          this.getLiftTotalCharge();
          this.subtotal();
        }
      })
    }
    else if (!this.UserLogin) {
      if (product_id) {
        this.CardShow?.map((res: any) => {
          if (res.product_id == product_id) {
            console.log(res.lift_gate);
            if (res.lift_gate == false || res.lift_gate == 0) {
              res.lift_gate = 0;
            }
            else if (res.lift_gate == true || res.lift_gate == 1) {
              res.lift_gate = 1;
            }
          }
        })
      }

      console.log(this.CardShow);
      this.subtotal();
      data.data = this.CardShow;
      console.log(data);
      localStorage.setItem('Cookies_Cart_Data', JSON.stringify(data));
    }
  }

  hazardous: number = 0;
  minimum_amount: any;
  async getStaticData() {
    this._ApiService.lift_charge.subscribe(res => {
      this.liftcharges = res;
    })
    await this._ApiService.getStaticData('minimum order').then(res => {
      this.minimum_amount = res.data.value;
    })
    await this._ApiService.getStaticData('hazardous').then(res => {
      this.hazardous = res.data.value;
    })
    await this._ApiService.getStaticData('CERT Fee').then(res => {
      console.log(res);
      this.certfee = res.data.value;
    })
    await this._ApiService.getStaticData('lift gate').then(res => {
      console.log(res);
      this.lift_gate_charge = res.data.value;
    })
  }

  checked: boolean = false;

  getLiftCharge(event: any) {
    this.checked = !this.checked;
    let lift_charge: boolean;
    if (!this.UserLogin) {
      let LiftCharge: boolean;
      if (this.checked) {
        LiftCharge = true;
      }
      else {
        LiftCharge = false;
      }
      localStorage.setItem("Lift_Gate_Charge_Guest_User", JSON.stringify(LiftCharge));
    }

    else {
      if (this.checked) {
        lift_charge = true;
      }
      else {
        lift_charge = false;
      }
      localStorage.setItem("Lift_Gate_Charge_User", JSON.stringify(lift_charge));
    }
  }

  saveLiftChargeValue() {
    if (this.SubTotal >= this.minimum_amount) {
      this.route.navigateByUrl('/shop/checkout');
    }
    else {
      this.route.navigateByUrl('/cart');
    }
  }

  CERTFeeAmount: number = 0;
  async getCERTFee(event: any) {
    // console.log(event.target.value); 
    this.CERTvalue = !this.CERTvalue;
    if (!this.UserLogin) {
      if (this.CERTvalue == true) {
        localStorage.setItem("CERT_Value_Guest_User", JSON.stringify(true));
        this.CERTFeeAmount = this.certfee;
      }
      else {
        localStorage.setItem("CERT_Value_Guest_User", JSON.stringify(false));
        this.CERTFeeAmount = 0;
      }
    }
    else {
      if (this.CERTvalue == true) {
        localStorage.setItem("CERT_Value_User", JSON.stringify(true));
        this.CERTFeeAmount = this.certfee;
      }
      else {
        localStorage.setItem("CERT_Value_User", JSON.stringify(false));
        this.CERTFeeAmount = 0;
      }
    }
  }


}
