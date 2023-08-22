import {
  Component,
  Renderer2,
  AfterViewInit,
  ViewChild,
  ElementRef, OnInit
} from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { Router } from "@angular/router";
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ApiServiceService } from 'src/app/Services/api-service.service';
import { ReCaptcha2Component } from 'ngx-captcha';

@Component({
  selector: 'app-internship-application',
  templateUrl: './internship-application.component.html',
  styleUrls: ['./internship-application.component.scss']
})
export class InternshipApplicationComponent implements OnInit {

  @ViewChild('test') test: ElementRef | any;
  userObj: any;
  invalidPostalCode = false;
  invalidUserEmail: string = '';
  resSignupMsg: string = '';
  resSignupMsgCheck: string = ' ';
  invalidMobile = false;
  invalidEmail: boolean = false;
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component | any;
  @ViewChild('langInput') langInput: ElementRef | any;

  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;

  public theme: 'light' | 'light' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio' | any;
  form_fields:any = [];
  constructor(private __apiservice: ApiServiceService, private renderer: Renderer2, private scroller: ViewportScroller, private router: Router) { }

  ngOnInit(): void {
    this.form_fields = [{
      "First Name*" : "",
      "Last Name*" : "",
      "Email Address*" : "",
      "Mobile Number*" : "",
      "City*" : "",
      "State*" : "" ,
      "Country*" : "",
      "ZIP Code*" : "",
      "Upload Resume*" : ""
    }]
  }
  chemistForm = new UntypedFormGroup({
    firstname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    lastname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    email: new UntypedFormControl('', Validators.required),
    phone: new UntypedFormControl('', Validators.required),
    address: new UntypedFormControl('', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]),
    country: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    state: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    city: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    zip: new UntypedFormControl('', Validators.required),
    document1: new UntypedFormControl('', Validators.required),
    recaptcha: new UntypedFormControl('', Validators.required)
  }, { updateOn: 'blur' }
  );

  form_data : any = [];
  saveAskChemistDetail() {
    console.log(this.chemistForm.value , this.UploadDocuments);
    this.form_data = [];
    this.chemistForm.value.document1 = this.UploadDocuments[0];
    if (this.chemistForm.valid) {
      let data = this.chemistForm.value
      console.log(data);
      this.form_fields = [{
        "First Name*" : data.firstname,
        "Last Name*" : data.lastname,
        // "Email Address*" : data.email,
        "Mobile Number*" : data.phone,
        "City*" : data.city,
        "State*" : data.state,
        "Country*" : data.country,
        "ZIP Code*" : data.zip,
      }]
      let internship_application_form = new FormData();
      for(let key in this.form_fields[0]){
        let object_uploadedd = {name : key , type : "text", value : this.form_fields[0][key] }
        this.form_data.push(object_uploadedd)        
      }

      this.form_data.push({name : 'uploaded_resume' , type : "file", value : ''})
      internship_application_form.append("form_id" , "Intership_Application_Form");
      internship_application_form.append("form_data" , JSON.stringify(this.form_data));
      this.UploadDocuments.map((res:any , index:any)=>{
        internship_application_form.append(`uploaded_resume[${index}]` , res);
      })
      console.log(this.form_data);   
      this.__apiservice.submitJSONFormDetail(internship_application_form).subscribe((res:any)=>{
        console.log(res);  
        this.chemistForm.reset();
        this.captchaElem.resetCaptcha(); 
        Object.keys(this.chemistForm.controls).forEach(key => {
        this.chemistForm.controls[key].setErrors(null)
        }); 
        this.resSignupMsg = 'Form Submitted Successfully!';
        this.resSignupMsgCheck = 'success';
        setTimeout(() => {
          this.resSignupMsg = '';
        }, 4000);    
      })
      // this.userObj = {
      //   first_name: data.firstname,
      //   last_name: data.lastname,
      //   email: data.email,
      //   type: "internonboarding",
      //   phone: data.phone,
      //   address_1: data.address,
      //   country: data.country,
      //   state: data.state,
      //   city: data.city,
      //   zip: data.zip,
      //   recaptcha: data.recaptcha,
      //   input_1: data.input_11,
      //   input_2: data.input_12,
      //   input_3: data.input_13
      // };
      // this.__apiservice.submitFormDetail(this.userObj).subscribe((res: any) => {
      //   console.log(res);
      //   this.chemistForm.reset();
      //   this.captchaElem.resetCaptcha();
      //   // Remove validators after form submission
      //   Object.keys(this.chemistForm.controls).forEach(key => {
      //     this.chemistForm.controls[key].setErrors(null)
      //   });

      //   this.resSignupMsg = 'Form Submitted Successfully!';
      //   this.resSignupMsgCheck = 'success';
      //   setTimeout(() => {
      //     this.resSignupMsg = '';
      //   }, 4000);
      // }
      // )
    }
    else {
      this.getResponseBySignIn();
      this.captchaElem.resetCaptcha();
      this.resSignupMsgCheck = 'danger';
      this.resSignupMsg = 'Please Fill all the Fields!';
      setTimeout(() => {
        this.resSignupMsg = '';
      }, 3000);
    }
  }

  close() {
    this.renderer.setStyle(this.test.nativeElement, 'display', 'none');
    this.resSignupMsg = '';
  }
  goToTop() {
    window.scrollTo(0, 0);
    this.scroller.scrollToAnchor("backToTop");
  }
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
    const value = event.target?.value;

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
  inputPincode(event: any) {
    if (
      event.key?.length === 1 &&
      !/^[0-9]$/.test(event.key)
    ) {
      event.preventDefault();
    }
  }
  validatePincode(event: any) {
    const value = event.target?.value;

    if (
      value &&
      /^[0-9]+$/.test(value) &&
      value.length < 5
    ) {
      this.invalidPostalCode = true;
    }

    else {
      this.invalidPostalCode = false;
    }
  }
  inputMobile(event: any) {
    if (
      event.key?.length === 1 &&
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

  handleSuccess(captchaResponse: string): void {
    this.captchaSuccess = true;
    this.captchaResponse = captchaResponse;
    this.captchaIsExpired = false;
  }

  handleReset(): void {
    this.captchaSuccess = false;
    this.captchaResponse = undefined;
    this.captchaIsExpired = false;
  }

  resFormCaptchaMsg: string = ''
  getResponseBySignIn(): void {
    const response = this.captchaElem.getResponse();
    if (!response) {
      this.resFormCaptchaMsg = 'There is no response - have you submitted captcha?'
    }
    setTimeout(() => {
      this.resFormCaptchaMsg = ''
    }, 3000);
  }

  routeOnSamePage(slug: any) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/' + slug]);
  }

  UploadDocuments: any = [];
  images: any = [];
  onFileChange(event: any ) {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.images.push(event.target.result);
          this.patchValues();
          console.log(this.images, "docimages");
        }
        reader.readAsDataURL(event.target.files[i]);
        this.UploadDocuments.push(event.target.files[i]);
        console.log(event.target.files[i], "images file");
      }
    }
  }

  patchValues() {
    this.chemistForm.patchValue({
      fileSource: this.images
    });
  }
}
