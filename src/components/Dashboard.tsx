// components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, FileCheck, Clock, LogOut, Camera } from 'lucide-react';
import { authService } from '../services/api';
import { AuthLayout } from './AuthLayout';
import { KYCStatusResponse, UserData } from '../types/auth';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData);

        // Fetch KYC status if user exists
        const status = await authService.getKYCStatus();
        setKycStatus(status);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getKYCStatusColor = () => {
    if (user?.is_kyc) return 'text-green-600';
    if (user?.is_submitted) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKYCStatusText = () => {
    if (user?.is_kyc) return 'KYC Approved';
    if (user?.is_submitted) return 'KYC Pending';
    return 'KYC Not Submitted';
  };

  if (loading) {
    return (
      <AuthLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Dashboard">
      <div className="space-y-6">
        {/* User Profile Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserCircle className="h-12 w-12 text-gray-400" />
              <div>
                <h2 className="text-xl font-semibold">{user?.username}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* KYC Status Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileCheck className={`h-8 w-8 ${getKYCStatusColor()}`} />
              <div>
                <h3 className="text-lg font-medium">KYC Status</h3>
                <p className={`${getKYCStatusColor()}`}>{getKYCStatusText()}</p>
              </div>
            </div>
            
            {!user?.is_kyc && !user?.is_submitted && (
              <Link
                to="/kyc"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-5 w-5 mr-2" />
                Complete KYC
              </Link>
            )}
            
            {user?.is_submitted && !user?.is_kyc && (
              <div className="flex items-center text-yellow-600">
                <Clock className="h-5 w-5 mr-2" />
                Verification in progress
              </div>
            )}
          </div>
        </div>

        {/* KYC Details Section */}
        {(user?.is_submitted || user?.is_kyc) && kycStatus?.kyc_data && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">KYC Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{kycStatus.kyc_data.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted Date</p>
                <p className="font-medium">
                  {new Date(kycStatus.kyc_data.submitted_at).toLocaleDateString()}
                </p>
              </div>
              {user?.is_kyc && (
                <div>
                  <p className="text-sm text-gray-500">Verification ID</p>
                  <p className="font-medium">{user.unique_id}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Status Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <UserCircle className="h-6 w-6 text-gray-400" />
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">
                Account Status
              </h4>
              <p className={`text-lg font-medium ${
                user?.is_kyc ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {user?.is_kyc ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};