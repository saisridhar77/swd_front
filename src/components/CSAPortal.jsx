import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, Eye, EyeOff, CheckCircle, Clock, Filter, Search, Package, Building, Edit2, Save, X, Loader2 } from 'lucide-react';

const CSAPortal = ({ onBack }) => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [showBundleDetails, setShowBundleDetails] = useState(false);
  const [approving, setApproving] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [saving, setSaving] = useState(false);  

  const API_BASE_URL = 'https://merchpostalswd-690276173705.asia-south1.run.app/api';

  // Get auth token (same method as ClubCoordinatorPortal)
  const getAuthToken = () => {
    try {
      const stored = localStorage.getItem("swd_user");
      
      if (!stored) {
        return null;
      }
      
      const parsed = JSON.parse(stored);
      
      // Check if token exists in the stored data
      const token = parsed.token || null;
      
      return token;
    } catch (err) {
      console.error("CSA Portal - Error parsing stored user data:", err);
      return null;
    }
  };

  // Fetch bundles from API
  const fetchBundles = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? `${API_BASE_URL}/merch/csa/bundles`
        : `${API_BASE_URL}/merch/csa/bundles?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
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
      
      // Simple approval - bundle content is already updated via coordinator API
      const response = await fetch(`${API_BASE_URL}/merch/csa/bundles/${bundleId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
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
        setIsEditing(false);
        setEditingBundle(null);
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
          'Authorization': `Bearer ${getAuthToken()}`,
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
        setIsEditing(false);
        setEditingBundle(null);
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
    setEditingBundle(JSON.parse(JSON.stringify(bundle))); // Deep copy for editing
    setIsEditing(false);
    setShowBundleDetails(true);
  };

  // Start editing
  const startEditing = () => {
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingBundle(JSON.parse(JSON.stringify(selectedBundle))); // Reset to original
  };

  // Save edited bundle using CSA edit endpoint
  const saveEditedBundle = async () => {
    try {
      setSaving(true);
      
      // Use the CSA bundle edit endpoint
      const response = await fetch(`${API_BASE_URL}/merch/csa/bundles/${editingBundle._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingBundle.title,
          description: editingBundle.description,
          merchItems: editingBundle.merchItems,
          sizeCharts: editingBundle.sizeCharts,
          combos: editingBundle.combos
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update bundle');
      }

      const data = await response.json();
      if (data.success) {
        // Update the selected bundle and bundles list
        setSelectedBundle(editingBundle);
        setBundles(prev => prev.map(b => b._id === editingBundle._id ? editingBundle : b));
        setIsEditing(false);
        setSuccess('Bundle updated successfully!');
        
        // Add a flag to indicate this bundle has been edited
        editingBundle.hasBeenEdited = true;
        editingBundle.editedBy = 'CSA Admin';
        editingBundle.editedAt = new Date().toISOString();
      } else {
        throw new Error(data.message || 'Failed to update bundle');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save changes to an already approved bundle using CSA edit endpoint
  const saveChangesToApprovedBundle = async () => {
    try {
      setSaving(true);
      
      // Use the CSA bundle edit endpoint
      const response = await fetch(`${API_BASE_URL}/merch/csa/bundles/${editingBundle._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingBundle.title,
          description: editingBundle.description,
          merchItems: editingBundle.merchItems,
          sizeCharts: editingBundle.sizeCharts,
          combos: editingBundle.combos
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update bundle');
      }

      const data = await response.json();
      if (data.success) {
        // Clear the edited flag since changes have been saved
        editingBundle.hasBeenEdited = false;
        delete editingBundle.editedBy;
        delete editingBundle.editedAt;
        
        // Update the bundles list and selected bundle
        setBundles(prev => prev.map(b => b._id === editingBundle._id ? editingBundle : b));
        setSelectedBundle(editingBundle);
        setEditingBundle(JSON.parse(JSON.stringify(editingBundle)));
        
        setSuccess('Bundle changes saved successfully!');
      } else {
        throw new Error(data.message || 'Failed to update bundle');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update editing bundle field
  const updateEditingBundle = (field, value) => {
    setEditingBundle(prev => ({ ...prev, [field]: value }));
  };

  // Update merch item
  const updateMerchItem = (index, field, value) => {
    setEditingBundle(prev => ({
      ...prev,
      merchItems: prev.merchItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Update combo
  const updateCombo = (index, field, value) => {
    setEditingBundle(prev => ({
      ...prev,
      combos: prev.combos.map((combo, i) => 
        i === index ? { ...combo, [field]: value } : combo
      )
    }));
  };

  // Remove merch item
  const removeMerchItem = (index) => {
    setEditingBundle(prev => ({
      ...prev,
      merchItems: prev.merchItems.filter((_, i) => i !== index)
    }));
  };

  // Remove combo
  const removeCombo = (index) => {
    setEditingBundle(prev => ({
      ...prev,
      combos: prev.combos.filter((_, i) => i !== index)
    }));
  };

  // Remove size chart
  const removeSizeChart = (index) => {
    setEditingBundle(prev => ({
      ...prev,
      sizeCharts: prev.sizeCharts.filter((_, i) => i !== index)
    }));
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

  // Clear error and success after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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
    <>
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

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
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
        {showBundleDetails && selectedBundle && editingBundle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingBundle.title}
                        onChange={(e) => updateEditingBundle('title', e.target.value)}
                        className="text-2xl font-bold text-gray-900 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">{selectedBundle.title}</h2>
                    )}
                    
                    {isEditing ? (
                      <textarea
                        value={editingBundle.description}
                        onChange={(e) => updateEditingBundle('description', e.target.value)}
                        className="text-gray-600 mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows="2"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{selectedBundle.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!isEditing ? (
                      <button
                        onClick={startEditing}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={saveEditedBundle}
                          disabled={saving}
                          className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>{saving ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        setShowBundleDetails(false);
                        setSelectedBundle(null);
                        setIsEditing(false);
                        setEditingBundle(null);
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
              </div>

                             {/* Bundle Info */}
               <div className="p-6 border-b border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Information</h3>
                 
                 {/* Edit Status Indicator */}
                 {selectedBundle.hasBeenEdited && (
                   <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                     <div className="flex items-center space-x-2">
                       <Edit2 className="w-4 h-4 text-blue-600" />
                       <span className="text-sm font-medium text-blue-800">Bundle has been edited</span>
                     </div>
                     <p className="text-xs text-blue-600 mt-1">
                       Edited by {selectedBundle.editedBy} on {new Date(selectedBundle.editedAt).toLocaleDateString()}
                     </p>
                   </div>
                 )}
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              {/* Merch Items */}
              {editingBundle.merchItems && editingBundle.merchItems.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Merch Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editingBundle.merchItems.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="aspect-square mb-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                            }}
                          />
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateMerchItem(index, 'name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateMerchItem(index, 'price', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              step="0.01"
                              min="0"
                            />
                            <textarea
                              value={item.description || ''}
                              onChange={(e) => updateMerchItem(index, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              rows="2"
                              placeholder="Description"
                            />
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                            <p className="text-lg font-bold text-green-600 mb-2">₹{item.price}</p>
                            {item.nick && (
                              <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mb-2">Nick Option</span>
                            )}
                            {item.description && (
                              <p className="text-sm text-gray-600">{item.description}</p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Charts */}
              {editingBundle.sizeCharts && editingBundle.sizeCharts.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Size Charts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editingBundle.sizeCharts.map((chart, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                        <img 
                          src={chart} 
                          alt={`Size Chart ${index + 1}`}
                          className="w-full h-auto rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Size+Chart+Not+Found';
                          }}
                        />
                        {isEditing && (
                          <button
                            onClick={() => removeSizeChart(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Combos */}
              {editingBundle.combos && editingBundle.combos.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Combos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editingBundle.combos.map((combo, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={combo.name}
                              onChange={(e) => updateCombo(index, 'name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="number"
                              value={combo.comboPrice}
                              onChange={(e) => updateCombo(index, 'comboPrice', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              step="0.01"
                              min="0"
                            />
                            <textarea
                              value={combo.description || ''}
                              onChange={(e) => updateCombo(index, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              rows="2"
                              placeholder="Description"
                            />
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500">Includes:</p>
                              <div className="flex flex-wrap gap-1">
                                {combo.items.map((item, itemIndex) => (
                                  <span 
                                    key={itemIndex} 
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => removeCombo(index)}
                              className="w-full px-2 py-1 text-red-600 hover:bg-red-100 rounded text-sm"
                            >
                              Remove Combo
                            </button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold text-gray-900 mb-2">{combo.name}</h4>
                            <p className="text-lg font-bold text-blue-600 mb-2">₹{combo.comboPrice}</p>
                            {combo.description && (
                              <p className="text-sm text-gray-600 mb-3">{combo.description}</p>
                            )}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500">Includes:</p>
                              <div className="flex flex-wrap gap-1">
                                {combo.items.map((item, itemIndex) => (
                                  <span 
                                    key={itemIndex} 
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

                             {/* Approval Actions - At the Bottom */}
               <div className="p-6 bg-gray-50">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Actions</h3>
                 
                                   {/* Edit Notice */}
                  {selectedBundle.hasBeenEdited && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Edit2 className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Bundle has been edited</span>
                      </div>
                                             <p className="text-xs text-yellow-600 mt-1">
                         {selectedBundle.approvalStatus === 'pending' 
                           ? 'Bundle content has been updated. You can now approve the bundle with the new content.'
                           : 'Bundle content has been updated. Click "Save Changes" to apply the changes immediately.'
                         }
                       </p>
                    </div>
                  )}
                 
                 <div className="flex flex-col sm:flex-row gap-3">
                  {selectedBundle.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => approveBundle(selectedBundle._id, true)}
                        disabled={approving || isEditing}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {approving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Approve & Make Visible
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => approveBundle(selectedBundle._id, false)}
                        disabled={approving || isEditing}
                        className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {approving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Approve & Keep Hidden
                          </>
                        )}
                      </button>
                    </>
                  )}

                                     {selectedBundle.approvalStatus === 'approved' && (
                     <div className="flex flex-col sm:flex-row gap-3 w-full">
                       {/* Save Changes Button - Only show if bundle has been edited */}
                       {selectedBundle.hasBeenEdited && (
                         <button
                           onClick={saveChangesToApprovedBundle}
                           disabled={saving || isEditing}
                           className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                         >
                           {saving ? (
                             <>
                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                               Saving Changes...
                             </>
                           ) : (
                             <>
                               <Save className="w-5 h-5 mr-2" />
                               Save Changes
                             </>
                           )}
                         </button>
                       )}
                       
                       {/* Toggle Visibility Button */}
                       <button
                         onClick={() => toggleBundleVisibility(selectedBundle._id)}
                         disabled={togglingVisibility || isEditing}
                         className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                       >
                         {togglingVisibility ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                             Updating...
                           </>
                         ) : selectedBundle.visibility ? (
                           <>
                             <EyeOff className="w-5 h-5 mr-2" />
                             Hide Bundle
                           </>
                         ) : (
                           <>
                             <Eye className="w-5 h-5 mr-2" />
                             Make Visible
                           </>
                         )}
                       </button>
                     </div>
                   )}
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
                         {bundle.hasBeenEdited && (
                           <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                             <Edit2 className="w-3 h-3 mr-1" />
                             Edited
                           </span>
                         )}
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
    <footer class="w-full border-t border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
  Made with ❤️ from 
  <span class="font-bold text-[#3aa6a1]"> Dev</span>
  <span class="font-bold text-[#24353f]">Soc</span>
</footer>
    </>
  );
};

export default CSAPortal; 