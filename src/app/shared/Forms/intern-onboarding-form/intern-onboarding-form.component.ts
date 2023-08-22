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
  selector: 'app-intern-onboarding-form',
  templateUrl: './intern-onboarding-form.component.html',
  styleUrls: ['./intern-onboarding-form.component.scss']
})
export class InternOnboardingFormComponent implements OnInit {

  @ViewChild('test') test: ElementRef | any;
  userObj: any;
  invalidPostalCode = false;
  invalidUserEmail: string = '';
  resSignupMsg: string = '';
  resSignupMsgCheck: string = ' ';
  invalidMobile = false;
  invalidEmail: boolean = false;
  form_fields: any = [];
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
  count: any;
  constructor(private __apiservice: ApiServiceService, private renderer: Renderer2, private scroller: ViewportScroller, private router: Router) { }

  ngOnInit(): void {
    this.form_fields = [{
      "First Name*": "",
      "Last Name*": "",
      "Email Address*": "",
      "Mobile Number*": "",
      "Name of Bank or Credit Union*": "",
      "Bank or Credit Union Account Number*": "",
      "Bank or Credit Union Routing & Transit Number (ABA number)*": "",
      "Street Address*": "",
      "City*": "",
      "State*": "",
      "Country*": "",
      "ZIP Code*": "",
      "Upload W-9 Form*": "",
      "Upload Georgia NDA*": "",
    }]
  }
  chemistForm = new UntypedFormGroup({
    name_of_bank_or_credit_union: new UntypedFormControl('', Validators.required),
    bank_or_credit_union_account_number: new UntypedFormControl('', Validators.required),
    bank_or_credit_union_routing_and_transit_number: new UntypedFormControl('', Validators.required),
    firstname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    lastname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    email: new UntypedFormControl('', Validators.required),
    phone: new UntypedFormControl('', Validators.required),
    address: new UntypedFormControl('', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]),
    country: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    state: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    city: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    zip: new UntypedFormControl('', Validators.required),
    document1: new UntypedFormControl([], Validators.required),
    document2: new UntypedFormControl([], Validators.required),
    recaptcha: new UntypedFormControl('', Validators.required)
  }, { updateOn: 'blur' }
  );


  form_data_object: any = [];
  saveAskChemistDetail() {
    this.form_data_object = [];
    this.chemistForm.value.document1 = this.object.Upload_W9_Form;
    this.chemistForm.value.document2 = this.object.Upload_georgia_NDA;
    console.log(this.chemistForm.value, this.chemistForm.valid, this.object.Upload_W9_Form);
    if (this.chemistForm.valid) {
      let data = this.chemistForm.value;
      this.form_fields = [{
        "First Name*": data.firstname,
        "Last Name*": data.lastname,
        "Email Address*": data.address,
        "Mobile Number*": data.phone,
        "Name of Bank or Credit Union*": data.name_of_bank_or_credit_union,
        "Bank or Credit Union Account Number*": data.bank_or_credit_union_account_number,
        "Bank or Credit Union Routing & Transit Number (ABA number)*": data.bank_or_credit_union_routing_and_transit_number,
        "Street Address*": data.address,
        "City*": data.city,
        "State*": data.state,
        "Country*": data.country,
        "ZIP Code*": data.zip,
      }]

      let intern_onboarding_form = new FormData();
      for (let key in this.form_fields[0]) {
        let object_uploaded = { name: key, type: "text", value: this.form_fields[0][key] }
        this.form_data_object.push(object_uploaded);
      }

      this.form_data_object.push({ name: "Upload W-9 Form*", type: "file", value: ""})
      this.form_data_object.push({ name: "Upload Georgia NDA*", type: "file", value: ""})
      console.log(this.form_data_object);
      intern_onboarding_form.append("form_data" , JSON.stringify(this.form_data_object));

      this.object.Upload_W9_Form?.map((res:any , index:any)=>{
        intern_onboarding_form.append(`Upload W-9 Form*[${index}]` , res);
      })

      intern_onboarding_form.append("form_id" , "Intern_Onboarding_Form")      
      this.object.Upload_georgia_NDA?.map((res:any , index:any)=>{
        intern_onboarding_form.append(`upload georgia NDA*[${index}]` , res);
      })



      this.__apiservice.submitJSONFormDetail(intern_onboarding_form).subscribe((res: any) => {
        console.log("submit", res);
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
    }
    else {
      // this.getResponseBySignIn();
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
  object: any = {};
  image_object: any = {};
  onFileChange(event: any, index: any) {
    if (event.target.files && event.target.files[0]) {
      let document_upload: any = [];
      // this.object = {}
      let images: any = [];
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          images.push(event.target.result);
          this.patchValues();
          console.log(this.images, "docimages");
        }
        reader.readAsDataURL(event.target.files[i]);
        console.log(event.target.files[i], "images file");
        if (index == 0) {
          document_upload.push(event.target.files[i]);
          this.object.Upload_W9_Form = document_upload;
          this.image_object.Upload_W9_Form = images;
        }

        else if (index == 1) {
          document_upload.push(event.target.files[i]);
          this.object.Upload_georgia_NDA = document_upload;
          this.image_object.Upload_W9_Form = images;
        }
      }
    }
  }

  patchValues() {
    this.chemistForm.patchValue({
      fileSource: this.images
    });
  }

  removedocument(id: any, image_id: any) {
    console.log(id, image_id);

    if (id == 0) {
      console.log(this.object.Upload_W9_Form);
    }
  }
}


