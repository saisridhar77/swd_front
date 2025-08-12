import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, Eye, EyeOff, CheckCircle, Clock, Filter, Search, Package, Building } from 'lucide-react';

const CSAPortal = ({ onBack }) => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [showBundleDetails, setShowBundleDetails] = useState(false);
  const [approving, setApproving] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  const API_BASE_URL = 'https://merchportalswd-796324132621.asia-south1.run.app/api';

  // Fetch bundles from API
  const fetchBundles = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? `${API_BASE_URL}/merch/csa/bundles`
        : `${API_BASE_URL}/merch/csa/bundles?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }

      const data = await response.json();
      if (data.success) {
        setBundles(data.data.bundles);
      } else {
        throw new Error(data.message || 'Failed to fetch bundles');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve a bundle
  const approveBundle = async (bundleId, visibility = true) => {
    try {
      setApproving(true);
      const response = await fetch(`${API_BASE_URL}/merch/csa/bundles/${bundleId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visibility })
      });

      if (!response.ok) {
        throw new Error('Failed to approve bundle');
      }

      const data = await response.json();
      if (data.success) {
        // Refresh bundles list
        await fetchBundles();
        setShowBundleDetails(false);
        setSelectedBundle(null);
      } else {
        throw new Error(data.message || 'Failed to approve bundle');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setApproving(false);
    }
  };

  // Toggle bundle visibility
  const toggleBundleVisibility = async (bundleId) => {
    try {
      setTogglingVisibility(true);
      const response = await fetch(`${API_BASE_URL}/merch/csa/bundles/${bundleId}/visibility`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle bundle visibility');
      }

      const data = await response.json();
      if (data.success) {
        // Refresh bundles list
        await fetchBundles();
        setShowBundleDetails(false);
        setSelectedBundle(null);
      } else {
        throw new Error(data.message || 'Failed to toggle bundle visibility');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingVisibility(false);
    }
  };

  // View bundle details
  const viewBundleDetails = async (bundle) => {
    setSelectedBundle(bundle);
    setShowBundleDetails(true);
  };

  // Filter bundles based on search term and status
  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bundle.club?.clubName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bundle.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Load bundles on component mount
  useEffect(() => {
    fetchBundles();
  }, [statusFilter]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getStatusBadge = (status, visibility) => {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    } else if (status === 'approved') {
      return visibility ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Eye className="w-3 h-3 mr-1" />
          Visible
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <EyeOff className="w-3 h-3 mr-1" />
          Hidden
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CSA Portal</h1>
                  <p className="text-sm text-gray-500">Bundle Approval & Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bundles by title or club name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchBundles}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Bundle Details Modal */}
        {showBundleDetails && selectedBundle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedBundle.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedBundle.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBundleDetails(false);
                      setSelectedBundle(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bundle Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Club:</span>
                        <p className="text-gray-900">{selectedBundle.club?.clubName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <div className="mt-1">{getStatusBadge(selectedBundle.approvalStatus, selectedBundle.visibility)}</div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Created:</span>
                        <p className="text-gray-900">
                          {new Date(selectedBundle.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedBundle.approvedAt && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Approved:</span>
                          <p className="text-gray-900">
                            {new Date(selectedBundle.approvedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                    <div className="space-y-3">
                      {selectedBundle.approvalStatus === 'pending' && (
                        <button
                          onClick={() => approveBundle(selectedBundle._id, true)}
                          disabled={approving}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          {approving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Make Visible
                            </>
                          )}
                        </button>
                      )}

                      {selectedBundle.approvalStatus === 'approved' && (
                        <button
                          onClick={() => toggleBundleVisibility(selectedBundle._id)}
                          disabled={togglingVisibility}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          {togglingVisibility ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
                            </>
                          ) : selectedBundle.visibility ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Hide Bundle
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Make Visible
                            </>
                          )}
                        </button>
                      )}

                      {selectedBundle.approvalStatus === 'pending' && (
                        <button
                          onClick={() => approveBundle(selectedBundle._id, false)}
                          disabled={approving}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          {approving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Keep Hidden
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bundles List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bundles ({filteredBundles.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bundles...</p>
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bundles found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No bundles have been created yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBundles.map((bundle) => (
                <div key={bundle._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{bundle.title}</h3>
                        {getStatusBadge(bundle.approvalStatus, bundle.visibility)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span>{bundle.club?.clubName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created {new Date(bundle.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {bundle.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">{bundle.description}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => viewBundleDetails(bundle)}
                        className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSAPortal; 