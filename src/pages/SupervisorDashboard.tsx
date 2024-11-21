import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Appraisal } from '../types/auth';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Calendar,
  Star,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [filteredAppraisals, setFilteredAppraisals] = useState<Appraisal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState({
    rating: 0,
    remarks: ''
  });

  useEffect(() => {
    fetchAppraisals();
  }, []);

  useEffect(() => {
    filterAppraisals();
  }, [searchTerm, filterStatus, sortBy, appraisals]);

  const fetchAppraisals = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/supervisor/appraisals', {
        withCredentials: true
      });
      setAppraisals(response.data);
    } catch (error) {
      console.error('Error fetching appraisals:', error);
    }
  };

  const filterAppraisals = () => {
    let filtered = [...appraisals];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (appraisal) =>
          appraisal.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appraisal.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((appraisal) => appraisal.status === filterStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.employeeName.localeCompare(b.employeeName);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredAppraisals(filtered);
  };

  const handleFeedbackSubmit = async (appraisalId: number) => {
    try {
      await axios.post(
        `http://localhost:3000/api/supervisor/feedback/${appraisalId}`,
        feedback,
        { withCredentials: true }
      );
      setEditingId(null);
      setFeedback({ rating: 0, remarks: '' });
      fetchAppraisals();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleDeleteFeedback = async (appraisalId: number) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(
          `http://localhost:3000/api/supervisor/feedback/${appraisalId}`,
          { withCredentials: true }
        );
        fetchAppraisals();
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Appraisal Management</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search appraisals..."
                  className="pl-10 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md px-4 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
              </select>
              <select
                className="border rounded-md px-4 py-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredAppraisals.map((appraisal) => (
              <div
                key={appraisal.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{appraisal.employeeName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(appraisal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      appraisal.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {appraisal.status}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{appraisal.content}</p>

                {editingId === appraisal.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFeedback({ ...feedback, rating: star })}
                            className={`${
                              feedback.rating >= star
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            <Star className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        value={feedback.remarks}
                        onChange={(e) =>
                          setFeedback({ ...feedback, remarks: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFeedbackSubmit(appraisal.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Feedback
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {appraisal.supervisorRemarks && (
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="flex items-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= appraisal.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{appraisal.supervisorRemarks}</p>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingId(appraisal.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {appraisal.supervisorRemarks ? 'Edit Feedback' : 'Add Feedback'}
                      </button>
                      {appraisal.supervisorRemarks && (
                        <button
                          onClick={() => handleDeleteFeedback(appraisal.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Feedback
                        </button>
                      )}
                    </div>
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