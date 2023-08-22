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
  selector: 'app-custom-bland-solution',
  templateUrl: './custom-bland-solution.component.html',
  styleUrls: ['./custom-bland-solution.component.scss']
})
export class CustomBlandSolutionComponent implements OnInit {


  @ViewChild('test') test: ElementRef | any;
  userObj: any;
  selected_instance: any[] = [];
  invalidPostalCode = false;
  invalidUserEmail: string = '';
  resSignupMsg: string = '';
  resSignupMsgCheck: string = ' ';
  invalidMobile = false;
  invalidEmail: boolean = false;
  price_quantity: any = [];
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
  selectedValues: string[] = [];
  form_fields: any = [{}];
  selected_packaging_size: any;
  constructor(private __apiservice: ApiServiceService, private renderer: Renderer2, private scroller: ViewportScroller, private router: Router) { }

  ngOnInit(): void {
    this.form_fields = [{
      "First Name*": "",
      "Last Name*": "",
      "Email Address*": "",
      "Mobile Number*": "",
      "Street Address": "",
      "City*": "",
      "State*": "",
      "Country*": "",
      "ZIP Code*": "",
      "What is your target evaporation rate": "",
      "What is your target flash point": "",
      "What is your target Vapor pressure": "",
      "What is your target Volatile Organic Compounds(VOC)": "",
      "What are you looking to clean?": "",
      "What type of soil or dirt are you looking to clean?": "",
      "What product are you currently utilizing and what amount?": "",
      "Why are you looking to change the product?": "",
      "Are you looking to change any of the following": ""
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
    evaporation_input: new UntypedFormControl(''),
    flash_point_input: new UntypedFormControl(''),
    vapor_pressure_input: new UntypedFormControl(''),
    VOC_input: new UntypedFormControl(''),
    input_11: new UntypedFormControl(''),
    input_12: new UntypedFormControl(''),
    input_13: new UntypedFormControl(''),
    input_14: new UntypedFormControl(''),
    input_15: new UntypedFormControl(''),
    input_16: new UntypedFormControl(''),
    recaptcha: new UntypedFormControl('')
  }, { updateOn: 'blur' }
  );

  form_data: any = [];
  saveAskChemistDetail() {
    console.log(this.chemistForm.value);
    this.form_data = [];
    if (this.chemistForm.valid) {
      let data = this.chemistForm.value;
      this.form_fields = [{
        "First Name*": data.firstname,
        "Last Name*": data.lastname,
        "Email Address*": data.email,
        "Mobile Number*": data.phone,
        "Street Address": data.address,
        "City*": data.city,
        "State*": data.state,
        "Country*": data.country,
        "ZIP Code*": data.zip,
        // "Are you looking to change any of the following" : this.selected_instance,
        "What price range and quantity are you looking for": this.price_quantity,
        "What are you looking to clean?": data.input_11,
        "What type of soil or dirt are you looking to clean?": data.input_12,
        "What product are you currently utilizing and what amount?": data.input_13,
        "Why are you looking to change the product?": data.input_14,
        // "Would you like your solvent in drums, pales, or aerosol cases" : this.selected_packaging_size
      }]

      console.log(this.form_fields);

      for (let key in this.form_fields[0]) {
        if(this.form_fields[0][key] != ''){
          let object_uploadedd = { name: key, type: "text", value: this.form_fields[0][key] }
          this.form_data.push(object_uploadedd);
        }
      }

      if (this.selected_instance?.length > 0) {
        this.form_data.push({name : "Are you looking to change any of the following", type : "array" , value : this.selected_instance})
      }

      if (this.selected_packaging_size?.length > 0) {
        this.form_data.push({name : "Would you like your solvent in drums, pales, or aerosol cases", type : "array" , value :  this.selected_packaging_size})
      }



      if (this.selected_instance?.length > 0) {
        this.selected_instance.map((res: any) => {
          console.log(res);
          if (res == "evaporation_rate") {
            this.form_data.push({ name: "What is your target evaporation rate", type: "text", value: data.evaporation_input })
          }
          if (res == "flash_point") {
            this.form_data.push({ name: "What is your target flash point", type: "text", value: data.flash_point_input })
          }

          if (res == "vapor_pressure") {
            this.form_data.push({ name: "What is your target Vapor pressure", type: "text", value: data.vapor_pressure_input })
          }

          if (res == "organic_compounds") {
            this.form_data.push({ name: "What is your target Volatile Organic Compounds(VOC)", type: "text", value: data.VOC_input })
          }
        })
      }

      this.price_range?.map((res: any) => {
        if (res.checked == true) {
          this.form_data.push({ name: "What is the price range of your current solution", type: "text", value: res.range })
        }
      })

      this.drum_object?.map((res: any) => {
        if (res.checked == true) {
          this.form_data.push({ name: "How many drums are you looking for? 1 Drum = 55 gallons", type: "text", value: res.range })
        }
      })

      this.pails_object?.map((res: any) => {
        if (res.checked == true) {
          this.form_data.push({ name: "How many drums are you looking for? 1 Pail = 5 Gallons", type: "text", value: res.range })
        }
      })

      this.aerosol_object?.map((res: any) => {
        if (res.checked == true) {
          this.form_data.push({ name: "How many aerosol cases are you looking for? 1 Case = 12 Aerosol Cans", type: "text", value: res.range })
        }
      })

      let custom_blad_solution = new FormData();
      custom_blad_solution.append("form_id", "Custom_Blade_Solution")
      custom_blad_solution.append("form_data", JSON.stringify(this.form_data));
      console.log(this.form_data);
      this.__apiservice.submitJSONFormDetail(custom_blad_solution).subscribe((res: any) => {
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
    }
    else {
      // this.getResponseBySignIn();
      // this.captchaElem.resetCaptcha();
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
  inputPincode(event: any) {
    if (
      event.key?.length === 1 &&
      !/^[0-9]$/.test(event.key)
    ) {
      event.preventDefault();
    }
  }
  validatePincode(event: any) {
    const value = event.target.value;

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

  evaporate_rate_boolean: boolean = false;
  flash_point_boolean: boolean = false;
  odor_smell_boolean: boolean = false;
  vapor_pressure_boolean: boolean = false;
  VOC_boolean: boolean = false;
  price_boolean: boolean = false;
  packing_boolean: boolean = false;
  drum_boolean: boolean = false;
  pails_boolean: boolean = false;
  aerosol_boolean: boolean = false;

  price_range: any = [
    { id: 1, 'range': "Under - $500", checked: false },
    { id: 2, 'range': "$500-$1000", checked: false },
    { id: 3, 'range': "$1000-$1500", checked: false },
    { id: 4, 'range': "$1500- Above", checked: false }
  ]

  drum_object: any = [
    // { id: 1, 'range': "Uder - 36 Pails", checked: false },
    // { id: 2, 'range': "36- 109 Pails", checked: false },
    // { id: 3, 'range': "110 - Above", checked: false },
    { id: 1, 'range': "Under 4 Drums", checked: false },
    { id: 2, 'range': "4 -20 Drums", checked: false },
    { id: 3, 'range': "20 - over", checked: false },
  ]

  pails_object: any = [
    { id: 1, 'range': "Uder - 36 Pails", checked: false },
    { id: 2, 'range': "36- 109 Pails", checked: false },
    { id: 3, 'range': "110 - Above", checked: false },
  ]
  aerosol_object: any = [
    { id: 1, 'range': "Under 31 Cases", checked: false },
    { id: 2, 'range': "31- 109 Cases", checked: false },
    { id: 3, 'range': "110 - over", checked: false },
  ]

  price_range_selection(event: any, id: any) {
    console.log(event);
    this.price_range.map((res: any) => {
      if (res.id == id) {
        res.checked = true;
      }
      else {
        res.checked = false;
      }
    })
    console.log(this.price_range);
  }

  drum_selection(event: any, id: any) {
    console.log(event);
    this.drum_object.map((res: any) => {
      if (res.id == id) {
        console.log("Status");
        res.checked = !res.checked
      }
    })

    console.log(this.drum_object);
  }

  pails_selection(event: any, id: any) {
    console.log(event);
    this.pails_object.map((res: any) => {
      if (res.id == id) {
        res.checked = true;
      }
      else {
        res.checked = false;
      }
    })
    console.log(this.pails_object);
  }

  aerosol_case_selection(event: any, id: any) {
    console.log(event);
    this.aerosol_object.map((res: any) => {
      if (res.id == id) {
        res.checked = true;
      }
      else {
        res.checked = false;
      }
    })
    console.log(this.pails_object);
  }
}
