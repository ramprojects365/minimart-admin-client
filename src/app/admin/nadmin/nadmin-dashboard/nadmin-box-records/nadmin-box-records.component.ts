import { Component, OnInit } from '@angular/core';

import { NadminDashboardService } from '../nadmindashboard.service';
import { AdminLoginService } from '../../../../services/admin/admin-login/adminlogin.service';

@Component({
  selector: 'app-nadmin-box-records',
  templateUrl: './nadmin-box-records.component.html',
  styleUrls: ['./nadmin-box-records.component.scss']
})
export class NadminBoxRecordsComponent implements OnInit {

  userShopCount = 0;
  userBranchCount = 0;
  userOrderCount = 0;
  userActiveOrderCount = 0;
  userReceivedOrderAmount = 0;
  userPendingOrderAmount = 0;

  constructor(
    private nadminDashboardService: NadminDashboardService,
    private adminLoginService: AdminLoginService,
  ) { }

  ngOnInit() {
    this.userShopCount = 0;
    this.userBranchCount = 0;
    this.userOrderCount = 0;
    this.userActiveOrderCount = 0;
    this.userReceivedOrderAmount = 0;
    this.userPendingOrderAmount = 0;
    this.getShopCount();
    this.getBranchCount();
    this.getOrderCount();
    this.getOrderAmount();
  }

  getShopCount() {
    const adminId = this.adminLoginService.adminUser.getValue().adminId;
    this.nadminDashboardService.getShopCount(adminId)
      .subscribe(
        shops => {
          this.userShopCount = shops.payload.shops_count ?? 0;
        }, () => {
          this.userShopCount = 0;
        });
  }

  getBranchCount() {
    const adminId = this.adminLoginService.adminUser.getValue().adminId;
    this.nadminDashboardService.getBranchCount(adminId)
      .subscribe(
        shops => {
          this.userBranchCount = shops.payload.branch_count ?? 0;
        }, () => {
          this.userBranchCount = 0;
        });
  }

  getOrderCount() {
    const adminId = this.adminLoginService.adminUser.getValue().adminId;
    this.nadminDashboardService.getOrderCount(adminId)
      .subscribe(
        shops => {
          this.userOrderCount = shops.payload.orders_count ?? 0;
          this.userActiveOrderCount = shops.payload.active_count ?? 0;
        }, () => {
          this.userOrderCount = 0;
          this.userActiveOrderCount = 0;
        });
  }

  getOrderAmount() {
    const adminId = this.adminLoginService.adminUser.getValue().adminId;
    this.nadminDashboardService.getOrderAmounts(adminId)
      .subscribe(
        shops => {
          this.userReceivedOrderAmount = shops.payload.received_amount ?? 0;
          this.userPendingOrderAmount = shops.payload.pending_amount ?? 0;
        }, () => {
          this.userReceivedOrderAmount = 0;
          this.userPendingOrderAmount = 0;
        });
  }

}
