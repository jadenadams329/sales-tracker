export interface UserLogin {
    email: string;
    password: string;
  }

  export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }

  export interface ApiError {
    title: string;
    errors: {
      [key: string]: string | undefined;
    };
    message?: string;
  }

  export interface UserSignup {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }

  export interface Sale {
    id: number;
    userId: number;
    accountNumber: number;
    agreementLength: string;
    planType: string;
    initialPrice: number;
    monthlyPrice: number;
    autopay: string;
    serviceDate: string;
    serviced: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface CountsData {
    agreementLength: {
      'One-time': number;
      '12 Months': number;
      '24 Months': number;
    };
    planType: {
      'One-time': number;
      'Basic': number;
      'Pro': number;
      'Premium': number;
    };
    autopay: {
      'None': number;
      'CC': number;
      'ACH': number;
    };
    serviced: {
      'Pending': number;
      'Yes': number;
      'No': number;
    };
  }

  export interface SaleResponse {
    data: {
      sales: Sale[];
      counts: CountsData;
    };
  }
  