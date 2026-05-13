import { Component, OnInit, NgZone, ElementRef, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl, NgForm } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

import { AdminLoginService } from '../../../../services/admin/admin-login/adminlogin.service';
import { NadminSettingsService } from '../nadminsettings.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-nadmin-editbranch',
  templateUrl: './nadmin-editbranch.component.html',
  styleUrls: ['./nadmin-editbranch.component.scss']
})
export class NadminEditbranchComponent implements OnInit {

  public latitude: number;
  public longitude: number;
  public zoom: number;
  private geoCoder;

  userShops: any[] = [];
  shopCategoriesList: any[] = [];
  currencies: any[] = [];

  selectedCurrency: string = '';
  userShop: any = '';
shopCategory: any = '';
  opening_time: any;
  closing_time: any;
  uploadedImage: string;
  isPosEnabled = false;
  track_stock = false;
  isAdminDelivery = false;

  theme = { themes: '1' };
  branchId: string;
  branchDetails?: any;

  @ViewChild('search', { static: false })
  public searchElementRef: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private adminLoginService: AdminLoginService,
    private nadminSettingsService: NadminSettingsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private title: Title,
    private metaService: Meta
  ) { }

  ngOnInit() {
    this.title.setTitle("Mini Mart | Indian grocery shopping in Malaysia | Download today");
    this.metaService.updateTag(
      { name: 'keywords', content: 'Big basket, freshly handpicked groceries, Indian grocery shopping in Malaysia, online grocery shopping app, grocery home delivery, Food and grocery in Malaysia' }
    );
    this.metaService.updateTag(
      { name: 'description', content: 'Malaysia No. 1 Indian, local and international grocery and F&B online store. From rice, lentils, spice blends to ready-to-eat instant mixes and snacks imported.' }
    );
    this.metaService.updateTag(
      { name: 'robots', content: 'index, follow' }
    );
    this.branchDetails = {};
    this.uploadedImage = '';
    this.currencies = [
      { label: 'BND', value: 'BND' },
      { label: 'INR', value: 'INR' },
      { label: 'RM', value: 'RM' },
      { label: 'USD', value: 'USD' },
    ];
    this.branchId = this.route.snapshot.paramMap.get('branch');
    if (isPlatformBrowser(this.platformId)) {
      // MouseEvent code
      this.getBranchDetails();
      this.getShops();
      this.shopCategories();
    }
  }
  getShops() {
    const adminId = this.adminLoginService.adminUser.getValue()?.adminId;
    if (!adminId) {
      this.userShops = [];
      this.userShop = null;
      return;
    }
    this.nadminSettingsService.getAllUsersShops(adminId)
      .subscribe(
        shops => {
          const remoteShops = shops?.payload?.shops;
          if (!Array.isArray(remoteShops) || remoteShops.length === 0) {
            this.userShops = [];
            this.userShop = null;
            return;
          }
          this.userShops = remoteShops.map(item => {
            return { label: item.shop_name, value: item.shop_id };
          });
          // this.userShop = this.userShops[0].value;
          // console.log(this.userShops);
        });
  }
  shopCategories() {
    this.nadminSettingsService.getShopCategories()
      .subscribe(
        categories => {
          const remoteCategories = categories?.payload?.categories;
          if (!Array.isArray(remoteCategories) || remoteCategories.length === 0) {
            this.shopCategoriesList = [];
            this.shopCategory = null;
            return;
          }
          this.shopCategoriesList = remoteCategories.map(item => {
            return { label: item.category_name, value: item.category_id };
          });
          //this.shopCategory = this.shopCategories[0].value;
          //console.log(JSON.stringify(categories.payload));
        });
  }
  getBranchDetails() {
    this.nadminSettingsService.getBranchDetails(this.branchId)
      .subscribe(
        shops => {
          this.branchDetails = shops.payload.branchdetails[0];
          //console.log('branch details -------'+JSON.stringify(this.branchDetails));
          this.userShop = this.branchDetails.shop_id;
          this.shopCategory = this.branchDetails.branch_cat_id;
          this.selectedCurrency = this.branchDetails.currency;
          this.opening_time = new Date('01-01-2019 ' + this.branchDetails.open_time);
          this.closing_time = new Date('01-01-2019 ' + this.branchDetails.close_time);
          this.theme = { themes: this.branchDetails.home_screen_theme.toString() };
          this.isPosEnabled = this.branchDetails.isPosEnabled;
          this.track_stock = this.branchDetails.track_stock;
          this.isAdminDelivery = this.branchDetails.isAdminDelivery;
          this.latitude = parseFloat(this.branchDetails.latitude);
          this.longitude = parseFloat(this.branchDetails.longitude);
          this.initGoogleServices();
        });
  }

  initGoogleServices() {
    this.zoom = 15;

    this.loadGoogleMaps()
      .then(() => {
        if (!this.searchElementRef?.nativeElement) {
          console.error('Search input not found');
          return;
        }

        const googleObj = (window as any).google;

        if (!googleObj?.maps?.places) {
          console.error('Google Places library not loaded');
          return;
        }

        this.geoCoder = new googleObj.maps.Geocoder();

        const autocomplete = new googleObj.maps.places.Autocomplete(
          this.searchElementRef.nativeElement,
          {
            types: ['geocode'],
            componentRestrictions: { country: 'my' }
          }
        );

        autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
              this.toastr.warning('Please select a valid location from the dropdown');
              return;
            }

            this.latitude = place.geometry.location.lat();
            this.longitude = place.geometry.location.lng();
            this.zoom = 15;

            this.branchDetails.branch_addr =
              place.formatted_address || place.name || '';

            console.log('Selected place:', place);
            console.log('Latitude:', this.latitude);
            console.log('Longitude:', this.longitude);
          });
        });
      })
      .catch(error => {
        console.error('Google Maps failed to load:', error);
        this.toastr.error('Google Maps failed to load', 'Error!');
      });
  }
  private loadGoogleMaps(): Promise<void> {
    const win = window as any;

    if (win.google?.maps?.places) {
      return Promise.resolve();
    }

    const existingScript = document.querySelector(
      'script[data-google-maps-api]'
    ) as HTMLScriptElement;

    if (existingScript) {
      return new Promise((resolve, reject) => {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(), { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.src =
        'https://maps.googleapis.com/maps/api/js' +
        '?key=' + environment.googleMapsApiKey +
        '&libraries=places';

      script.async = true;
      script.defer = true;
      script.dataset.googleMapsApi = 'true';

      script.onload = () => resolve();
      script.onerror = error => reject(error);

      document.head.appendChild(script);
    });
  }

  markerDragEnd($event: any) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
  }
  uploadImage(event, addFileUpload) {
    // console.log(event.files[0]);
    if (event.files[0].size < 60000) {
      this.spinner.show();
      this.nadminSettingsService.uploadImage(event.files[0])
        .subscribe(
          response => {
            this.spinner.hide();
            // console.log(response);
            if (response.status === 200) {
              addFileUpload.clear();
              this.uploadedImage = response.payload.image;
            } else {
              // console.log(response);
              this.toastr.error('There was a problem uploading your image!', 'Image Upload Error!');
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(error.error.message, 'Error!');
          }
        );
    } else {
      this.toastr.error('Please upload the small size image.', 'Image Size Bigger!');
      addFileUpload.clear();
    }
  }
  updateBranch(form: NgForm, addFileUpload) {
    if (!form.valid) {
      this.toastr.warning('Please fill all the details!', 'Add All Details.');
      return;
    }
    const value = form.value;

    if (value.phone.length < 12 || value.phone.length > 13 || value.phone[0] !== '+') {
      this.toastr.warning('Please check the + and country code', 'Invalid Phone Number');
      return;
    }
    if (value.maxdistance > 30) {
      this.toastr.warning('Radius should not be more than 30', 'Please check the Radius');
      return;
    }
    if (value.welcomeMessage !== null) {
      if (value.welcomeMessage.length > 400) {
        this.toastr.warning('Please check the welcome message', 'Lenght exceeded');
        return;
      }
    }
    if (this.uploadedImage !== '') {
      value.imageChanged = true;
      value.image = this.uploadedImage;
    } else {
      value.imageChanged = false;
      value.image = this.branchDetails.image;
    }

    if (value.minamount < 5) {
      this.toastr.warning('Minimum amount should not be less than 5', 'Please check the Minimum Amount');
      return;
    }
    value.delchargless3 = value.delchargless3.toString();
    value.delchargless5 = value.delchargless5.toString();
    value.delchargless10 = value.delchargless10.toString();
    value.delchargless15 = value.delchargless15.toString();
    value.delchargless20 = value.delchargless20.toString();
    value.latitude = this.latitude;
    value.longitude = this.longitude;
    value.isAdminDelivery = this.isAdminDelivery;
    value.branch_id = this.branchDetails.branch_id;
    // console.log(value);
    this.spinner.show();
    this.nadminSettingsService.updateBranch(value)
      .subscribe(
        response => {
          this.spinner.hide();
          // console.log(response);
          if (response.status === 201) {
            this.toastr.success('Your branch has been updated successfully!', 'Branch Updated!');
            this.uploadedImage = '';
            this.router.navigate(['/admin/nadmin/settings']);
          } else if (response.status === 406) {
            this.toastr.warning('You have not changed anything!', 'Nothing to save!');
          } else {
            this.toastr.error('There was a problem updating the branch!', 'Branch Add Error!');
          }
        }, error => {
          // addFileUpload.clear();
          this.spinner.hide();
          this.toastr.error(error.error.message, 'Error!');
        }
      );
  }
}
