import {
  Component,
  Renderer2,
  ViewChild,
  ElementRef, OnInit
} from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { Router } from "@angular/router";
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ApiServiceService } from 'src/app/Services/api-service.service';
import { ReCaptcha2Component } from 'ngx-captcha';

@Component({
  selector: 'app-scholarship-winners',
  templateUrl: './scholarship-winners.component.html',
  styleUrls: ['./scholarship-winners.component.scss']
})
export class ScholarshipWinnersComponent implements OnInit {

  @ViewChild('test') test: ElementRef | any;
  userObj: any;
  invalidPostalCode = false;
  invalidUserEmail: string = '';
  resSignupMsg: string = '';
  resSignupMsgCheck: string = ' ';
  invalidMobile = false;
  invalidEmail: boolean = false;
  value:boolean = false;
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
  form_fields : any = [];
  constructor(private __apiservice: ApiServiceService, private renderer: Renderer2, private scroller: ViewportScroller, private router: Router) { }

  ngOnInit(): void {
    this.form_fields = [{
      "First Name*": "",
      "Last Name*": "",
      "Email Address*": "",
      "Mobile Number*": "",
      "Street Address*": "",
      "Current University or College Attending":"",
      "City*": "",
      "State*": "",
      "Country*": "",
      "ZIP Code*": "",
      "Direct Deposit: Enter Complete Name of Bank*": "",
      "Enter Bank Routing or ABA Number (9 numbers)*": "",
      "Enter your Checking Account Number*": "",
    }]
  }

  chemistForm = new UntypedFormGroup({
    firstname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    lastname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    email: new UntypedFormControl('', Validators.required),
    phone: new UntypedFormControl('', Validators.required),
    address: new UntypedFormControl('', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]),
    city: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    state: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    country: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]),
    zip: new UntypedFormControl('', Validators.required),
    current_university_or_college_attending: new UntypedFormControl('', Validators.required),
    direct_deposit_enter_complete_name_of_bank: new UntypedFormControl('', Validators.required),
    enter_bank_routing_or_ABA_number: new UntypedFormControl('', Validators.required),
    enter_your_checking_account_number: new UntypedFormControl('', Validators.required),
    document1: new UntypedFormControl([], Validators.required),
    document2: new UntypedFormControl([], Validators.required),
    recaptcha: new UntypedFormControl('', Validators.required)
  }, { updateOn: 'blur' }
  );

  form_data_object : any = [];
  saveAskChemistDetail() {
    console.log(this.chemistForm.value , this.object);
    this.chemistForm.value.document1 = this.object.student_id
    this.chemistForm.value.document2 = this.object.SIGNED_and_completed_W9_Form
    this.form_data_object = [];
    if (this.chemistForm.valid) {
      let data = this.chemistForm.value
      console.log(data);
      this.form_fields = [{
        "First Name*": data.firstname,
        "Last Name*": data.lastname,
        "Email Address*": data.address,
        "Mobile Number*": data.phone,
        "Street Address*": data.address,
        "Current University or College Attending":data.current_university_or_college_attending,
        "City*": data.city,
        "State*": data.state,
        "Country*": data.country,
        "ZIP Code*": data.zip,
        "Direct Deposit: Enter Complete Name of Bank*": data.direct_deposit_enter_complete_name_of_bank,
        "Enter Bank Routing or ABA Number (9 numbers)*": data.enter_bank_routing_or_ABA_number,
        "Enter your Checking Account Number*": data.enter_your_checking_account_number,
      }]


      let intern_onboarding_form = new FormData();
      for (let key in this.form_fields[0]) {
        let object_uploaded = { name: key, type: "text", value: this.form_fields[0][key] }
        this.form_data_object.push(object_uploaded);
      }

      intern_onboarding_form.append("form_id" , "Scholarship_Winner");
      this.form_data_object.push({name: "Student_ID", type: "file", value: ""})
      this.form_data_object.push({name: "SIGNED_and_completed_W9_Form", type: "file", value: ""})
      intern_onboarding_form.append("form_data" , JSON.stringify(this.form_data_object));

      console.log(this.form_data_object);
      this.object.student_id?.map((res:any , index:any)=>{
        intern_onboarding_form.append(`Student_ID[${index}]` , res);
      })

      this.object.SIGNED_and_completed_W9_Form?.map((res:any , index:any)=>{
        intern_onboarding_form.append(`SIGNED and completed W-9 Form[${index}]` , res);
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
  object: any = {};
  image_object: any = {};
  onFileChange(event: any, index: any) {
    console.log(index , event);
    
    if (event.target.files && event.target.files[0]) {
      let document_upload: any = [];
      // this.object = {}
      let images: any = [];
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          images.push(event.target.result);
          // this.patchValues();
        }
        reader.readAsDataURL(event.target.files[i]);
        console.log(event.target.files[i], "images file");
        if (index == 0) {
          document_upload.push(event.target.files[i]);
          this.object.student_id = document_upload;
          this.image_object.student_id = images;
          console.log(this.object);
          
        }

        else if (index == 1) {
          document_upload.push(event.target.files[i]);
          this.object.SIGNED_and_completed_W9_Form = document_upload;
          this.image_object.SIGNED_and_completed_W9_Form = images;
          console.log(this.object);
        }
      }
    }
  }


}
