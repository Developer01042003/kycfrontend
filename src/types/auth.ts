export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface KYCData {
  full_name: string;     // Single full name field
  contact_number: string;
  address: string;
  country: string;
  selfie: File;
}

export interface UserData {
  email: string;
  username: string;
  is_kyc: boolean;
  is_submitted: boolean;
  is_rejected: boolean;
  rejection_times: number;
  unique_id: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: UserData;
}

export interface KYCResponse {
  message: string;
  data?: {
      full_name: string;
      contact_number: string;
      status: string;
      submitted_at: string;
  };
}

export interface KYCStatusResponse {
  status: {
      is_kyc: boolean;
      is_submitted: boolean;
      is_rejected: boolean;
      rejection_times: number;
  };
  kyc_data?: {
      full_name: string;
      submitted_at: string;
      last_updated: string;
  };
  message?: string;
}