import { Component, OnInit, Input, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { NgForm } from '@angular/forms';
import { ApiServiceService } from 'src/app/Services/api-service.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  @ViewChild('test') test: ElementRef | any;
  passwrodCheck: boolean = false
  file: any = null;
  shimmarload: boolean = true;
  resEditProfileMsg: string = '';
  resEditProfileMsgCheck: string = '';
  userDetail: any = [];
  fromcheckoutdetail: any = {}
  shimmerLoad: boolean = true;
  userObj: any;
  resSignupMsg: string = '';
  invalidMobile = false;
  invalidEmail: boolean = false;
  invalidUserEmail: string = '';
  heading: any;
  invalidZip = false;
  cities: any;
  zip: any;
  allCitiesList: any[] = [];
  statesList: any[] = [];
  @ViewChild('inputfield') inputfield: ElementRef | any;
  @Input() showdesc: any;

  constructor(private __apiservice: ApiServiceService, private renderer: Renderer2, private scroller: ViewportScroller,) { }

  ngOnInit(): void {
    this.GetCitiesName();
    this.getFunction();
    this.__apiservice.UserAddress.subscribe((res: any) => {
      this.heading = res
    })
  }
  // City state Zip dropdown 
  GetCitiesName() {
    this.__apiservice.getCitiesByState().subscribe((res: any) => {
      this.allCitiesList = res;
      console.log(res, "cities list");
      const states: any = this.allCitiesList.map((city: any) => {
        return {
          code: city.state_code,
          state: city.state_name
        }
      })
      const unique: any = this.allCitiesList.filter(
        (item: any, pos: any, self: any) => self.findIndex((v: any) => v.state_code === item.state_code) === pos
      );
      console.log(unique, "statessss");
      this.statesList = unique;
    })
  }


  cityLists: any[] = [];
  selectedcityzip: any = '';
  getdata(event: any) {
    this.cityLists = [];
    console.log(event.target.value);
    this.allCitiesList.map((res: any) => {
      if (res.state_code == event.target.value) {
        console.log(res.state_code);
        console.log("res", res);
        this.cityLists.push(res);
      }
    })
    console.log("this.cities", this.cityLists);
    this.userDetail[0].city = this.cityLists[0].city;
    this.onChangecityFirstTime(this.cityLists[0].city);
  }

  onChangecity(event: any) {
    this.cityLists.map((res: any) => {
      if (res.city == event.target.value) {
        console.log(res.zip);
        this.selectedcityzip = res.zip;
        this.userDetail[0].pincode = res.zip;
        console.log(this.userDetail);
      }
    })
  }

  onChangecityFirstTime(event: any) {
    this.cityLists.map((res: any) => {
      if (res.city == event) {
        console.log(res.zip);
        this.selectedcityzip = res.zip;
        this.userDetail[0].pincode = res.zip;
        console.log(this.userDetail);
      }
    })
  }

  usertaxexemption: any = 0;

  // <<--Get User deatils Function-->>
  getFunction() {
    this.userDetail = []
    this.__apiservice.getUserProfileDetail().subscribe((res: any) => {
      this.shimmarload = false;
      this.userDetail.push(res.data);
      this.userDetail[0].documents;
      console.log(this.userDetail, "userdetail");
      this.userDetail.landmark = this.userDetail.landmark != "null" ? this.userDetail.landmark : '';
      console.log("this.userDetail.landmark", this.userDetail.landmark);
      this.allCitiesList.map((res: any) => {
        if (res.state_code == this.userDetail[0].state) {
          this.cityLists.push(res);
        }
      })
      this.userDetail.map((res: any) => {
        this.usertaxexemption = res.tax_exempt;
        setTimeout(() => {
          res.firstname = res.name.split(" ")[0]
          console.log("res", res);
        }, 500);
      })
      console.log(this.userDetail);
    })
  }

  // validate pincode 
  inputZip(event: any) {
    if (
      event.key.length === 1 &&
      !/^[0-9]$/.test(event.key)
    ) {
      event.preventDefault();
    }
  }

  validateZip(event: any) {
    const value = event.target.value;
    if (
      value &&
      /^[0-9]+$/.test(value) &&
      value.length < 5
    ) {
      this.invalidZip = true;
    }
    else {
      this.invalidZip = false;
    }
  }

  // <-- Edit User Profile-->
  editUserProfile(form: NgForm) {
    let header: any;
    this.shimmarload = true;
    console.log(form.value, form.valid);
    if (form.valid && this.validForedit) {
      let formData1 = new FormData();
      let data = Object.assign({}, form.value);

      header = localStorage.getItem('ecolink_user_credential');
      this.UploadDocuments.map((res: any, index: any) => {
        formData1.append(`files[${index}]`, res);
      })

      formData1.append('profile_image', this.file);
      formData1.append('name', data.firstname);
      formData1.append('email', data.email);
      formData1.append('mobile', data.phonenumber);
      formData1.append('address', data.address);
      formData1.append('country', "US");
      formData1.append('state', data.state);
      formData1.append('city', data.city);
      formData1.append('pincode', data.pincode);
      formData1.append('landmark', data.landmark);
      formData1.append('company_name', data.company_name);
      formData1.append('tax_exempt', this.usertaxexemption);
      if (data.password) {
        formData1.append('password', data.password);
      }
      this.__apiservice.editUserProfileInfo(formData1)
      .subscribe((res: any) => {
        console.log(res);
        this.images = []
        this.UploadDocuments = []
        this.docsCheck = false
        this.resEditProfileMsgCheck = 'success';
        this.resEditProfileMsg = res.message;
        this.__apiservice.profiledashboard.next(true);
        setTimeout(() => {
          this.resEditProfileMsg = '';
        }, 3000);
        this.getFunction();
        form.reset();
        this.passwrodCheck = false
      },
      (error:HttpErrorResponse)=>{
        this.shimmarload = false;
        this.resEditProfileMsg = error.error.message;
        this.resEditProfileMsgCheck = "danger"
        setTimeout(() => {
          this.resEditProfileMsg = ''
        }, 3000);
      }
      )
      
    }
    else {
      this.shimmarload = false;
      this.resEditProfileMsgCheck = 'danger';
      this.resEditProfileMsg = 'Please Fill the Fields Below!';
      setTimeout(() => {
        this.resEditProfileMsg = '';
      }, 2000);
    }
    // window.location.reload
  }

  // <-- Close toaster --> 
  close() {
    this.renderer.setStyle(this.test.nativeElement, 'display', 'none');
    this.resSignupMsg = '';
  }

  // <--for password input box true false-->
  changePassword() {
    this.passwrodCheck = !this.passwrodCheck;
    console.log()
  }

  // <-- Back to top on edit profile page -->
  goToTop() {
    window.scrollTo(0, 0);
    this.scroller.scrollToAnchor("backToTop");
  }

  // <-- for mobile validation Start-->
  inputMobile(event: any) {
    if (
      event.key.length === 1 &&
      !/^[0-9]$/.test(event.key)
    ) {
      event.preventDefault();
    }
  }

  validateMobile(event: any) {
    const value = event.target.value;
    if (
      value &&
      /^[0-9]+$/.test(value) &&
      value.length < 10
    ) {
      this.invalidMobile = true;
    }
    else {
      this.invalidMobile = false;
    }
  }

  // <-- User Profile Image -->
  GetFileChange(event: any) {
    let max_error_front_img: string = '';
    let fileUrl: any;
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size < 2000000) {
        const reader = new FileReader();
        reader.onload = (e: any) => fileUrl = e.target.result;
        reader.readAsDataURL(event.target.files[0]);
        this.file = event.target.files[0];
        max_error_front_img = "";
      } else {
        max_error_front_img = "Max file upload size to 2MB";
        fileUrl = 'https://breakthrough.org/wp-content/uploads/2018/10/default-placeholder-image.png';
        this.file = null;
      }
    }
  }

  // <-- User Email Validation Start -->
  validateUserEmail(email: any) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email.target.value) == false) {
      this.invalidUserEmail = 'Invalid Email Address';
      return false;
    }
    this.invalidUserEmail = '';
    return true;
  }

  validateEmail(event: any) {
    const value = event.target.value;
    if (
      value &&
      !/^[0-9]*$/.test(value) &&
      !this.validateUserEmail(event)
    ) {
      this.invalidEmail = true;
    }

    else {
      this.invalidEmail = false;
    }
  }

  docsCheck: boolean = false;
  validForedit: boolean = true;
  clickonradio(string: any) {
    if (string == 'yes') {
      this.validForedit = false;
      this.userDetail?.map((response: any) => {
        if (response.tax_exempt == 0) {
          this.docsCheck = true;
        }
      })
      if (!(this.UploadDocuments?.length == 0)) {
        this.validForedit = true
      }
      else {
        this.validForedit = false
      }
    }
    else {
      this.validForedit = true;
      this.docsCheck = false;
      this.images = [];
      this.UploadDocuments = [];
    }
  }


  url: boolean = true;
  images: string[] = [];
  UploadDocuments: any = [];
  onFileChange(event: any) {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      // console.log(event.target.files[0], "file");

      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.images.push(event.target.result);
          // this.patchValues();
          console.log(this.images, "docimages");
        }
        reader.readAsDataURL(event.target.files[i]);
        console.log(event.target.files[i], "images file");
        this.UploadDocuments.push(event.target.files[i])
      }
      if (this.UploadDocuments?.length > 0) {
        this.validForedit = true
      }
      else {
        this.validForedit = false
      }
    }
    setTimeout(() => {
      console.log(this.images)
      console.log(this.UploadDocuments)
    }, 2000);
  }

  removeImage(url: any, index: any) {
    console.log(this.inputfield.nativeElement.value)
    this.images = this.images.filter((img: any) => (img != url));
    console.log("remove", this.images, this.inputfield.nativeElement.value)
    this.UploadDocuments.splice(index, 1);
    // this.images.splice(index,1);
    if (this.images?.length == 0) {
      this.inputfield.nativeElement.value = ''
      this.images = []
      this.UploadDocuments = []
    }
    if (this.UploadDocuments?.length > 0) {
      this.validForedit = true
    }
    else {
      this.validForedit = false
    }
  }
}
