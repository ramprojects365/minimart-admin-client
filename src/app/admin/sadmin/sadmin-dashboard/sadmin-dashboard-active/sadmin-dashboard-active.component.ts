import { Component, OnInit } from '@angular/core';
import { AdminLoginService } from 'src/app/services/admin/admin-login/adminlogin.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';

import { SadminActiveService } from './sadmin-active.service';
import { UtilityService } from 'src/app/services/utilities.service';


@Component({
  selector: 'app-sadmin-dashboard-active',
  templateUrl: './sadmin-dashboard-active.component.html',
  styleUrls: ['./sadmin-dashboard-active.component.scss']
})
export class SadminDashboardActiveComponent implements OnInit {

  cols: any[];
  sales = [];
  statusItems = [];
  statusList = [];
  statusParam: string;
  saleId = '';
  displayStatusAdder = false;

  constructor(
    private utilityService: UtilityService,
    private adminLoginService: AdminLoginService,
    private sadminActiveService: SadminActiveService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.statusParam = 'Select Status';
    this.cols = [
      { field: 'displayName', header: 'Name' },
      { field: 'salesIdString', header: 'Sale Id' },
      { field: 'branch_name', header: 'Branch' },
      { field: 'date', header: 'Date' },
      { field: 'discount', header: 'Discount' },
      { field: 'delivery_charge', header: 'Delivery Charge' },
      { field: 'total', header: 'Total' },
      { field: 'status', header: 'Status' },
    ];
    this.sales = [];
    setTimeout(
      function () {
        location.reload();
      }, 10000000);
    this.getActiveOrders();
  }

  getActiveOrders() {
    this.sadminActiveService.getActiveOrders()
      .subscribe(
        sales => {
          const remoteSales = sales?.payload?.sales;
          if (Array.isArray(remoteSales) && remoteSales.length > 0) {
            this.sales = remoteSales.map(item => {
              item.date = this.utilityService.getDateTimeFormatted(item.date);
              return item;
            });
          } else {
            this.sales = [];
          }
          //console.log(this.sales);
        },
        () => {
          this.sales = [];
        });
  }
  addStatus(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const value = form.value;
    var newStatus = value.statusParam;

    if (newStatus !== 'Select Status') {
      this.sadminActiveService.addStatus(this.saleId, newStatus)
        .subscribe(
          status => {
            if (status.status == 201) {
              this.toastr.success('Status updated!', 'Update Successful!');
              this.displayStatusAdder = false;
              this.getActiveOrders();
            } else {
              this.toastr.error('Status updation has some problem!', 'Update Failed!');
            }
          });
    } else {
      this.toastr.error('Please select the status');
    }


  }

  showdisplayStatusAdder(order) {
    this.displayStatusAdder = true;

    this.saleId = order.sales_id;

    this.statusList = [];
    this.sadminActiveService.getStatus(order.sales_id)
      .subscribe(
        statusArr => {
          this.statusItems = statusArr.payload.status;
          //console.log(this.statusItems.length);
          if (this.statusItems.length == 1) {
            this.statusList = [
              { label: 'Select Status', value: 'Select Status' },
              { label: 'Accepted', value: 'Accepted' },
              { label: 'Cancelled', value: 'Cancelled' },
            ];
          } else if (this.statusItems.length == 2) {
            this.statusList = [
              { label: 'Select Status', value: 'Select Status' },
              { label: 'Delivered', value: 'Delivered' },
            ];
          } else if (this.statusItems.length == 3) {
            this.statusList = [
              { label: 'Select Status', value: 'Select Status' },
              { label: 'Delivered', value: 'Delivered' },
            ];
          } else {
            this.statusList = [];
          }
        });

  }

  updateStatus(order) {
    var r = confirm("Are you sure you want to update the status? This cannot be undone!");
    if (r == true) {
      this.sadminActiveService.updateStatus(order.sales_id, order.status_id, order.status)
        .subscribe(
          status => {
            //console.log(status.status); 
            if (status.status == 204) {
              this.toastr.success('Status deleted!', 'Delete Successful!');
              this.displayStatusAdder = false;
              this.getActiveOrders();
            } else {
              this.toastr.error('Status deletion has some problem!', 'Delete Failed!');
            }
          });
    }
  }
  cancelDisplayStatusAdder() {
    this.displayStatusAdder = false;
  }
  cancelOrder(order) {
    var r = confirm("Are you sure you want to Cancel this order? This cannot be undone!");
    if (r == true) {
      //console.log(order);
      this.sadminActiveService.cancelOrder(order.sales_id)
        .subscribe(
          sales => {
            this.getActiveOrders();
          });
    } else {
      // console.log("You pressed Cancel!");
    }
  }


}
