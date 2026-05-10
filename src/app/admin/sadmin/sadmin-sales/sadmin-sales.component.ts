import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { UtilityService } from '../../../services/utilities.service';
import { SadminSalesService } from './sadminsales.service';
import { AdminLoginService } from '../../../services/admin/admin-login/adminlogin.service';

@Component({
  selector: 'app-sadmin-sales',
  templateUrl: './sadmin-sales.component.html',
  styleUrls: ['./sadmin-sales.component.scss']
})
export class SadminSalesComponent implements OnInit {

  cols: any[];
  userShops = [];
  userShop: string;
  userBranches = [];
  userBranch: string;
  sales = [];

  constructor(
    private router: Router,
    private sadminSalesService: SadminSalesService,
    private adminLoginService: AdminLoginService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private utilityService: UtilityService,
    private title:Title
  ) { }

  ngOnInit() {
    this.cols = [
      { field: 'salesIdString', header: 'Sales ID' },
      { field: 'displayName', header: 'Name' },    
      { field: 'date', header: 'Date' },
      { field: 'discount', header: 'Discount' },
      { field: 'delivery_charge', header: 'Delivery Charge' },
      { field: 'total', header: 'Total' },
      { field: 'status', header: 'Status' },
    ];
    this.getShops();
    this.title.setTitle("Mini Mart: Grocery delivery from Lulu Hypermarket, Modern Stores, UM Stores | Download today");
  }

  getShops() {
    //const adminId = this.adminLoginService.adminUser.getValue().adminId;
    this.sadminSalesService.getAllUsersShops()
      .subscribe(
        shops => {
          const remoteShops = shops?.payload?.shops;
          if (Array.isArray(remoteShops) && remoteShops.length > 0) {
            this.userShops = remoteShops.map(item => {
              return { label: item.shop_name, value: item.shop_id };
            });
            this.userShop = this.userShops[0].value;
            this.getBranches(this.userShops[0].value);
          } else {
            this.userShops = [];
            this.userShop = null;
            this.userBranches = [];
            this.userBranch = null;
            this.sales = [];
          }
          // const shopIds = shops.payload.shops.map(item => item.shop_id.toString());
          // this.loadAdminUsers(shopIds.join(','));
        },
        () => {
          this.userShops = [];
          this.userShop = null;
          this.userBranches = [];
          this.userBranch = null;
          this.sales = [];
        });
  }

  getBranches(shopId) {
    this.sadminSalesService.getAllUsersBranches(shopId)
      .subscribe(
        branches => {
          const remoteBranches = branches?.payload?.branches;
          if (Array.isArray(remoteBranches) && remoteBranches.length > 0) {
            this.userBranches = remoteBranches.map(item => {
              return { label: item.branch_name, value: item.branch_id };
            });
          } else {
            this.userBranches = [];
          }
          this.userBranch = this.userBranches[0] ? this.userBranches[0].value : null;
          // console.log(this.userBranch);
          if (this.userBranch) {
            this.getAllSales(this.userBranch);
          } else {
            this.sales = [];
          }
        },
        () => {
          this.userBranches = [];
          this.userBranch = null;
          this.sales = [];
        },
      );
  }

  getAllSales(branchId) {
    this.sadminSalesService.getAllSales(branchId)
      .subscribe(
        shops => {
          const remoteSales = shops?.payload?.sales;
          if (Array.isArray(remoteSales) && remoteSales.length > 0) {
            this.sales = remoteSales.map(item => {
              item.date = this.utilityService.getDateTimeFormatted(item.date);
              return item;
            });
          } else {
            this.sales = [];
          }
          //console.log('sadmin sales'+ JSON.stringify(this.sales));
        },
        () => {
          this.sales = [];
        },
      );
  }
  changeShop(event) {
    this.getBranches(event.value);
  }
  changeBranch(event) {
    this.getAllSales(event.value);
  }
  // showDetails(sale) {
  //   this.sadminSalesService.SalesId = sale;
  //   this.router.navigate(['admin/nadmin/salesdetails']);
  // }

}
