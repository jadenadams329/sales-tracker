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
    // status: number;
    title: string;
    errors: {
      [key: string]: string | undefined;
    };
    message?: string;
  }