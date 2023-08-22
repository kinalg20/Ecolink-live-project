import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from '../Services/api-service.service';
import { Meta } from '@angular/platform-browser';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  remembertoken: any;
  constructor(private metaService : Meta, private scroller: ViewportScroller, private route: ActivatedRoute, private router: Router, private _apiService: ApiServiceService) { }

  ngOnInit(): void {
    this.metaService.addTag({name : "test", content : "test content"})
  }

  scrolldown(event: any) {
    this.scroller.scrollToAnchor("newsletter");
  }

}
