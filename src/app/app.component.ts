import { Component } from '@angular/core';
import { StripePaymentComponent } from "./Components/stripe-payment/stripe-payment.component";
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [CommonModule, StripePaymentComponent,ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
 totalAmount = 10;
 currencyType = 'USD';
 paymentConfiguration = {
  "StripePublishableKey": "pk_test_51Ngki8HfqYjMxVp8kyqm7RSJsEzJKQ3SDT8dlZywO4Zd4Qf7JDvTFjSNGGYrUZplYmh6DX3VdzPkdMzr2Wl9R1cd00LkACvsZi"
}
isShowSuccessPage = false;
donateClick = false;
personDetails: { firstname: string; lastname: string; email: string };

ngOnInit(): void {
  this.personDetails = {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
  };
}

  paymentSuccess(data) {
    if (data) {
      
      this.showsuccessPage();
    }
  }
  showsuccessPage()
  {
    this.isShowSuccessPage = true;
  }

  Submit() {
    this.donateClick = true;
      this.showsuccessPage();
  }
}
