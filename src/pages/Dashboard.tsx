import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Appraisal } from '../types/auth';

export default function Dashboard() {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [newAppraisal, setNewAppraisal] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users/appraisals', {
        withCredentials: true
      });
      setAppraisals(response.data);
    } catch (error) {
      console.error('Error fetching appraisals:', error);
    }
  };

  const handleSubmitAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3000/api/users/appraisal',
        { content: newAppraisal },
        { withCredentials: true }
      );
      setNewAppraisal('');
      fetchAppraisals();
    } catch (error) {
      console.error('Error submitting appraisal:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);

      await axios.put('http://localhost:3000/api/users/profile', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          {editMode ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-gray-600">
                Name: {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-600">Email: {user?.email}</p>
              <p className="text-gray-600">Role: {user?.role}</p>
              {user?.department && <p className="text-gray-600">Department: {user.department}</p>}
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Appraisals</h2>
          <form onSubmit={handleSubmitAppraisal} className="mb-6">
            <div>
              <label htmlFor="appraisal" className="block text-sm font-medium text-gray-700">
                New Appraisal
              </label>
              <textarea
                id="appraisal"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={newAppraisal}
                onChange={(e) => setNewAppraisal(e.target.value)}
                placeholder="Write your appraisal here..."
              />
            </div>
             Continuing directly from the previous response:

            <button
              type="submit"
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Appraisal
            </button>
          </form>

          <div className="space-y-6">
            {appraisals.map((appraisal) => (
              <div key={appraisal.id} className="border rounded-lg p-4">
                <p className="text-gray-700 mb-2">{appraisal.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Status: {appraisal.status}</span>
                  <span>
                    {new Date(appraisal.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {appraisal.supervisorRemarks && (
                  <div className="mt-4 bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700">Supervisor Remarks:</p>
                    <p className="text-sm text-gray-600">{appraisal.supervisorRemarks}</p>
                    {appraisal.rating && (
                      <p className="text-sm text-gray-600 mt-1">
                        Rating: {appraisal.rating}/5
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}