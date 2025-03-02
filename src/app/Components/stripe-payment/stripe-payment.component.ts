import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularStripeService } from '@fireflysemantics/angular-stripe-service';
import { regExp } from '../../Constants/global.contant';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'app-stripe-payment',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,InputTextModule,FloatLabel],
  providers:[AngularStripeService],
  templateUrl: './stripe-payment.component.html',
  styleUrl: './stripe-payment.component.scss'
})
export class StripePaymentComponent {
  @ViewChild('cardInfo', { static: false }) cardInfo: ElementRef;
  stripe;
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;
  submitForm = false;
  paymentForm: FormGroup;

  @Input() donateClick: boolean;
  @Input() person: any;
  @Input() paymentConfiguration:any;
  @Output() donateClickChange = new EventEmitter<boolean>();
  @Output() paymentSuccess = new EventEmitter<any>();

  publishableKey="";

  constructor(
    private stripeService: AngularStripeService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.pattern(regExp.emailRegEx), Validators.maxLength(64),Validators.required]],

    });
  }

  ngOnInit(): void {
    if (this.person?.email)
      this.paymentForm.controls['email'].setValue(this.person?.email);
    this.paymentForm.controls['firstName'].setValue(this.person?.firstname);
    this.paymentForm.controls['lastName'].setValue(this.person?.lastname);
  }


  ngOnChanges(changes): void {
    if (changes?.donateClick?.currentValue == true) {
      this.onSubmit();
    }
    if (changes?.paymentConfiguration?.currentValue) {
      this.publishableKey= changes?.paymentConfiguration?.currentValue?.StripePublishableKey;
      this.setPublicKey();
    }
  }

  get frmPayment(): any {
    return this.paymentForm.controls;
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.removeEventListener('change', this.cardHandler);
      this.card.destroy();
    }
  }

  setPublicKey() {
    this.stripeService.setPublishableKey(this.publishableKey).then(stripe => {
      const style = {
        base: {
          lineHeight: '24px',
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      };

      this.stripe = stripe;
      const elements = stripe.elements();
      this.card = elements.create('card', { style: style });
      if (this.cardInfo.nativeElement) {
        this.card.mount(this.cardInfo.nativeElement);
      }
      this.card.addEventListener('change', this.cardHandler);
    });
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  async onSubmit() {
    this.submitForm = true;
    if (!this.paymentForm.valid) {
      this.donateClickChange.emit(false);
      return;
    }

    const { token, error } = await this.stripe.createToken(this.card);
    if (error) {
      this.donateClickChange.emit(false);
      return;
    }

    const data = {
      firstName: this.paymentForm.controls['firstName'].value,
      lastName: this.paymentForm.controls['lastName'].value,
      email: this.paymentForm.controls['email'].value,
      token: token,
    };

    this.paymentSuccess.emit(data);
    this.donateClickChange.emit(false);
  }
}

