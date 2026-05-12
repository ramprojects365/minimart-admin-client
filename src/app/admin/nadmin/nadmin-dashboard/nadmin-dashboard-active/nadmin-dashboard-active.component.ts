import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NadminActiveService } from './nadmin-active.service';
import { UtilityService } from 'src/app/services/utilities.service';
import { AdminLoginService } from '../../../../services/admin/admin-login/adminlogin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nadmin-dashboard-active',
  templateUrl: './nadmin-dashboard-active.component.html',
  styleUrls: ['./nadmin-dashboard-active.component.scss']
})
export class NadminDashboardActiveComponent implements OnInit {

  userBranch: any;
  sales = [];
  cols: any[];

  constructor(
    private router: Router,
    private utilityService: UtilityService,
    private nadminActiveService: NadminActiveService,
    private adminLoginService: AdminLoginService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.cols = [
      { field: 'displayName', header: 'Name' },
      { field: 'branch_name', header: 'Branch' },
      { field: 'date', header: 'Date' },
      { field: 'discount', header: 'Discount' },
      { field: 'delivery_charge', header: 'Delivery Charge' },
      { field: 'total', header: 'Total' },
      { field: 'status', header: 'Status' },
    ];
    this.sales = [];
    const adminId = this.adminLoginService.adminUser.getValue().adminId;
    setTimeout(
      function () {
        location.reload();
      }, 10000000);
    this.getActiveOrders(adminId);
    // this.nadminActiveService.getMyBranch(adminId)
    //   .subscribe(
    //     branch => {
    //       this.userBranch = branch.payload.branchdetails[0] || null;
    //       this.getActiveOrders(adminId);
    //     });
  }

  getActiveOrders(adminId) {
    this.nadminActiveService.getActiveOrders(adminId)
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
          // console.log(JSON.stringify(this.sales));
        },
        () => {
          this.sales = [];
        },
      );
  }
  showDetails(sale) {
    this.nadminActiveService.SalesId = sale;
    this.router.navigate(['admin/nadmin/activeOrderDetails']);
  }

}
