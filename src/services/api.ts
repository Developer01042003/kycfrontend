import axios from 'axios';
import { 
    LoginCredentials, 
    SignupCredentials, 
    KYCData, 
    AuthResponse, 
    KYCResponse,
    KYCStatusResponse 
} from '../types/auth';

const api = axios.create({
    baseURL: 'https://creativeidd.onrender.com/api/auth',
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
        console.log('Sending signup request with data:', credentials); // Debug log
        
        const response = await axios({
            method: 'post',
            url: 'http://localhost:8000/api/auth/signup/',
            data: credentials,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Signup response:', response.data); // Debug log
        return response.data;
    } catch (error: any) {
        console.error('Signup error details:', {
            data: error.response?.data,
            status: error.response?.status,
            message: error.message
        });
        throw error;
    }
},

login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await axios({
            method: 'post',
            url: 'http://localhost:8000/api/auth/login/',
            data: credentials,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
},


    submitKYC: async (data: KYCData): Promise<KYCResponse> => {
        const formData = new FormData();
        
        // Add all KYC data to FormData
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await api.post<KYCResponse>('/kyc/submit/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('KYC submission error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Add method to get KYC status
    getKYCStatus: async (): Promise<KYCStatusResponse> => {
        try {
            const response = await api.get<KYCStatusResponse>('/kyc/status/');
            return response.data;
        } catch (error: any) {
            console.error('KYC status error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Add method to update KYC
    updateKYC: async (data: KYCData): Promise<KYCResponse> => {
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await api.put<KYCResponse>('/kyc/submit/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('KYC update error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Add method to logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Add method to get current user data
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Add method to check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};
