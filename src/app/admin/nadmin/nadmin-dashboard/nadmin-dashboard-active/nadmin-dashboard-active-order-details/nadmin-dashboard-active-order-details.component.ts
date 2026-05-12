import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { NadminActiveService } from '../nadmin-active.service';

@Component({
  selector: 'app-nadmin-dashboard-active-order-details',
  templateUrl: './nadmin-dashboard-active-order-details.component.html',
  styleUrls: ['./nadmin-dashboard-active-order-details.component.scss']
})
export class NadminDashboardActiveOrderDetailsComponent implements OnInit {
  sale: any;
  saleDetails = [];
  cols = [];
  grandTotal: any;
  total: any;
  totalItems = 0;
  address: any;
  addressString: string;
  constructor(
    private spinner: NgxSpinnerService,
    private title:Title,
    private location: Location,
    public router: Router,
    private nadminActiveService: NadminActiveService,
  ) { }

  ngOnInit() {
    this.title.setTitle("Mini Mart - Free delivery Mobile app for food and groceries");
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'item_price', header: 'Unit Price' },
      { field: 'quantity', header: 'Quantity' },
      { field: 'discount', header: 'Discount' },
      { field: 'total', header: 'Total' },
    ];
    this.sale = this.nadminActiveService.sale;
    this.saleDetails = [];
    this.address = null;
    this.addressString = '';
    if (!this.sale) {
      this.router.navigate(['admin/nadmin/active']);
      return;
    }
    this.getSalesDetails();
    this.getAddress(this.sale.address_id);
  }

  getAddress(addressId) {
    this.nadminActiveService.getAddress(addressId)
      .subscribe(
        details => {
          const addr = details?.payload?.address?.[0];
          if (addr) {
            this.address = addr;
            this.addressString = this.address.unit_number + ', ' + this.address.condo_name
              + ', ' + this.address.address + ', ' + this.address.pin_code;
          }
        },
        () => {
          this.address = null;
          this.addressString = '';
        },
      );
  }
  getSalesDetails() {
    this.nadminActiveService.getSaleDetails(this.sale.sales_id)
      .subscribe(
        details => {
          const remoteDetails = details?.payload?.saledetails;
          if (Array.isArray(remoteDetails) && remoteDetails.length > 0) {
            this.saleDetails = remoteDetails;
          } else {
            this.saleDetails = [];
          }
          this.totalItems = this.saleDetails.reduce((sum, item) => {
            return sum + parseFloat(item.quantity);
          }, 0);
          this.recalculateGrandTotal();
        },
        () => {
          this.saleDetails = [];
          this.totalItems = this.saleDetails.reduce((sum, item) => {
            return sum + parseFloat(item.quantity);
          }, 0);
          this.recalculateGrandTotal();
        },
      );
  }
  recalculateGrandTotal() {   
    this.grandTotal = 0;
    this.total = 0;
    this.saleDetails.forEach(element => {
      this.total += ((parseFloat(element.item_price) * parseFloat(element.quantity)));
      this.grandTotal += ((parseFloat(element.item_price) * parseFloat(element.quantity)) - parseFloat(element.discount));
    });
    this.grandTotal += (parseFloat(this.sale.delivery_charge)) - (this.sale.voucher_discount ? parseFloat(this.sale.voucher_discount) : 0);
    this.grandTotal = this.grandTotal.toFixed(2);
    this.total = this.total.toFixed(2);
  }

}
