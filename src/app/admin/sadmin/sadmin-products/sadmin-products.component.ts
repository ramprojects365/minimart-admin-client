import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { faEdit, faCheckCircle, faWindowClose } from '@fortawesome/free-regular-svg-icons';

import { SadminCategoriesService } from '../sadmin-category/sadmincategories.service';
import { SadminProductsService } from './sadminproducts.service';
import { NgForm } from '@angular/forms';
import { Title, Meta  } from '@angular/platform-browser';

@Component({
  selector: 'app-sadmin-products',
  templateUrl: './sadmin-products.component.html',
  styleUrls: ['./sadmin-products.component.scss']
})
export class SadminProductsComponent implements OnInit {

  // Icons
  iconEdit = faEdit;
  save = faCheckCircle;
  cancel = faWindowClose;
  // Icons end
  categories = [];
  products = [];
  cols: any[];
  displayEditor = false;
  displayProductAdder = false;
  clonedProduct: any;
  uploadedImage: string;
  selectedCategory: number;
  selectedCatInAddProd: number;

  constructor(
    private sadminCategoriesService: SadminCategoriesService,
    private sadminProductsService: SadminProductsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private title:Title,
    private metaService: Meta
  ) { }

  ngOnInit() {
    this.selectedCategory = 0;
    this.selectedCatInAddProd = 0;
    this.uploadedImage = '';
    this.clonedProduct = {};
    this.cols = [
      { field: 'company', header: 'Company' },
      { field: 'name', header: 'Name' },
      { field: 'sku', header: 'SKU' },
    ];
    this.categories = [];
    this.products = [];
    this.loadCategories();
    this.loadProducts();
    this.title.setTitle("Mini Mart - order food online Malaysia - order groceries Minimart online");
    this.metaService.updateTag(
      { name: 'keywords', content: 'grocery delivery, best restaurants, easy payment, klang groceries, ipoh indian grocery' }
    );
    this.metaService.updateTag(
      { name: 'description', content: 'Order food and grocery delivery ✓ The best restaurants and grocery shops near you ✓ Large variety of household and products ✓ Safe & easy payment options. The most affordable Food Delivery in Malaysia. Delivery within 1 hour' }
    );
    this.metaService.updateTag(
      { name: 'robots', content: 'index, follow' }
    );
  }

  loadCategories() {
    this.sadminCategoriesService.getAllCategories()
      .subscribe(
        categories => {
          // console.log(categories.payload.categories);
          const remoteCategories = categories?.payload?.categories;
          if (Array.isArray(remoteCategories) && remoteCategories.length > 0) {
            this.categories = remoteCategories;
          } else {
            this.categories = [];
          }
          this.categories.map(item => {
            item.label = item.category_name;
            item.value = item.category_id;
          });
          this.selectedCatInAddProd = this.categories[0]?.value || 0;
        }, () => {
          this.categories = [];
          this.selectedCatInAddProd = 0;
        });
  }

  loadProducts() {
    this.sadminProductsService.getAllProducts()
      .subscribe(
        products => {
          // console.log(products.payload.products);
          const remoteProducts = products?.payload?.products;
          if (Array.isArray(remoteProducts) && remoteProducts.length > 0) {
            this.products = remoteProducts;
          } else {
            this.products = [];
          }
        }, () => {
          this.products = [];
        });
  }

  showEditorDialog() {
    this.displayEditor = true;
  }

  cancelEdit(form: NgForm, editFileUpload) {
    form.reset();
    this.clonedProduct = {};
    this.uploadedImage = '';
    this.displayEditor = false;
    editFileUpload.clear();
  }

  onRowEditInit(product) {
    this.clonedProduct = { ...product };
    // console.log(this.clonedProduct);
    this.selectedCategory = parseInt(this.clonedProduct.category_id);
    this.showEditorDialog();
  }

  uploadImage(event, addFileUpload) {
    // console.log(event.files[0]);
    if(event.files[0].size < 60000){
      this.spinner.show();
      this.sadminProductsService.uploadImage(event.files[0])
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
    }else{
      this.toastr.error('Please upload the small size image.', 'Image Size Bigger!');
      addFileUpload.clear();
    }
   
  }

  updateProduct(form: NgForm, editFileUpload) {
    if (!form.valid) {
      return;
    }
    const value = form.value;
    // console.log('Product_id ' + JSON.stringify(this.clonedProduct));
    // console.log('Image ' + this.uploadedImage);
    if (this.uploadedImage !== '') {
      value.imageChanged = true;
      value.image = this.uploadedImage;
    }else{
      value.imageChanged = false;
      value.image = this.clonedProduct.image;
    }
    // console.log(value);
    this.spinner.show();
    this.sadminProductsService.updateProduct(value, this.clonedProduct.product_id)
      .subscribe(
        response => {
          this.spinner.hide();
          // console.log(response);
          if (response.status === 201) {
            this.toastr.success('Your edit has been saved!', 'Save Successful!');
            editFileUpload.clear();
            this.clonedProduct = {};
            this.displayEditor = false;
            this.loadProducts();
          } else if (response.status === 406) {
            this.toastr.warning('You have not changed anything!', 'Nothing to save!');
          } else {
            this.toastr.error('There was a problem updating the product!', 'Product Update Error!');
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.message, 'Error!');
        }
      );
  }

  showdisplayProductAdder() {
    this.selectedCatInAddProd = this.categories[0].category_id;
    this.displayProductAdder = true;
  }

  cancelProductAdder(form: NgForm, addFileUpload) {
    form.reset();
    // this.clonedProduct = {};
    this.uploadedImage = '';
    addFileUpload.clear();
    this.displayProductAdder = false;
  }

  addProduct(form: NgForm, addFileUpload) {
    if (!form.valid) {
      return;
    }
    if (this.uploadedImage === '') {
      this.toastr.warning('Please select an image!', 'Select Image');
      return;
    }
    const value = form.value;
    value.image = this.uploadedImage;
    // console.log(value);
    this.spinner.show();
    this.sadminProductsService.addProduct(value)
      .subscribe(
        response => {
          this.spinner.hide();
          // console.log(response);
          if (response.status === 201) {
            this.toastr.success('Your product has been added successfully!', 'Product Added!');
            this.uploadedImage = '';
            addFileUpload.clear();
            form.reset();
            this.clonedProduct = {};
            this.displayProductAdder = false;
            this.loadProducts();
          } else {
            this.toastr.error('There was a problem adding the product!', 'Product Add Error!');
          }
        }, error => {
          addFileUpload.clear();
          this.spinner.hide();
          this.toastr.error(error.error.message, 'Error!');
        }
      );
  }

}
