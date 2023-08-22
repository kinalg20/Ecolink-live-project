import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {
  orderdetail: any = [];
  total_amount: number = 0;
  user_order_detail: any = [];
  total_payable_detail : any = [];
  order_id :any;
  constructor() { }

  ngOnInit(): void {
    localStorage.removeItem("Cookies_Cart_Data");
    let order_detail = localStorage.getItem('OrderInfo'); 
    if (order_detail) {
      this.orderdetail = JSON.parse(order_detail);
    }

    this.orderdetail.map((res: any, index: any , arr:any) => {
      console.log(res);
      if(arr.length-1 === index){
        this.total_payable_detail.push(res);       
      }
      else {
        this.user_order_detail.push(res);
      }
    })

    this.total_payable_detail.map((res:any)=>{
      this.order_id = res.order_id;
    })
  }
}
