import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera } from 'lucide-react';
import { authService } from '../services/api';

const kycSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  contact_number: z.string().min(10, 'Contact number must be at least 10 digits'),
  address: z.string().min(10, 'Please enter a complete address'),
  country: z.string().min(2, 'Please select a country'),
});

type KYCForm = z.infer<typeof kycSchema>;

export const KYC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<KYCForm>({
    resolver: zodResolver(kycSchema),
  });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setSelfieImage(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setSelfieImage(null);
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const onSubmit = async (data: KYCForm) => {
    if (!selfieImage) {
      alert('Please capture a selfie');
      return;
    }

    try {
      setIsSubmitting(true);
      const selfieFile = dataURLtoFile(selfieImage, 'selfie.jpg');

      await authService.submitKYC({
        full_name: data.full_name,
        contact_number: data.contact_number,
        address: data.address,
        country: data.country,
        selfie: selfieFile
      });

      alert('KYC submitted successfully');
      // Optionally redirect or show success message
    } catch (error: any) {
      console.error('KYC submission failed:', error);
      alert(error.response?.data?.error || 'KYC submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">KYC Verification</h2>
          <p className="mt-2 text-gray-600">Please complete your verification</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              {...register('full_name')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              {...register('contact_number')}
              type="tel"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter your contact number"
            />
            {errors.contact_number && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              {...register('address')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter your complete address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              {...register('country')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a country</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">Selfie Verification</label>
            <div className="relative">
              {!selfieImage ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={capture}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-blue-700"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Capture</span>
                  </button>
                </>
              ) : (
                <div className="relative">
                  <img src={selfieImage} alt="Selfie" className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={retake}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                  >
                    Retake
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit KYC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};