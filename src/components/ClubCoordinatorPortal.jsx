import React, { useState, useEffect } from 'react';
import { Award, ArrowLeft, Plus, Edit2, Trash2, Loader2, Upload, X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

const ClubCoordinatorPortal = ({ onBack }) => {
  const [storedUser] = useState(() => {
    try {
      const stored = localStorage.getItem("swd_user");
      return stored ? JSON.parse(stored).user : null;
    } catch (err) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Bundle form state
  const [bundleForm, setBundleForm] = useState({
    title: '',
    description: '',
    merchItems: [],
    sizeCharts: [],
    combos: []
  });

  // Current item being edited
  const [editingItem, setEditingItem] = useState(null);
  const [editingCombo, setEditingCombo] = useState(null);

  // Form states for adding items
  const [newMerchItem, setNewMerchItem] = useState({
    name: '',
    price: '',
    description: '',
    image: ''
  });

  const [newCombo, setNewCombo] = useState({
    name: '',
    items: [],
    comboPrice: '',
    description: ''
  });

  const [newSizeChart, setNewSizeChart] = useState('');

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingSizeChart, setUploadingSizeChart] = useState(false);

  const API_BASE_URL = 'https://merchportalswd-796324132621.asia-south1.run.app/api';

  // Get auth token
  const getAuthToken = () => {
    try {
      const stored = localStorage.getItem("swd_user");
      return stored ? JSON.parse(stored).token : null;
    } catch (err) {
      return null;
    }
  };

  // API headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

  // Upload image to Firebase Storage
  const uploadImage = async (file, folder = 'merch-items') => {
    try {
      const timestamp = Date.now();
      const fileName = `${folder}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  // Handle image file selection
  const handleImageSelect = async (event, type = 'merch') => {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    try {
      if (type === 'merch') {
        setUploadingImage(true);
        const imageUrl = await uploadImage(file, 'merch-items');
        setNewMerchItem(prev => ({ ...prev, image: imageUrl }));
      } else if (type === 'sizeChart') {
        setUploadingSizeChart(true);
        const imageUrl = await uploadImage(file, 'size-charts');
        setNewSizeChart(imageUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message);
    } finally {
      setUploadingImage(false);
      setUploadingSizeChart(false);
    }
  };

  // Fetch all bundles for the club
  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/merch/club/bundles`, {
        headers: getHeaders()
      });
      setBundles(response.data.data.bundles);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch bundles');
    } finally {
      setLoading(false);
    }
  };

  // Create new bundle
  const createBundle = async () => {
    try {
      if (!bundleForm.title.trim()) {
        setError('Bundle title is required');
        return;
      }

      if (bundleForm.merchItems.length === 0) {
        setError('At least one merch item is required');
        return;
      }

      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/merch/club/bundles`, bundleForm, {
        headers: getHeaders()
      });

      setSuccess('Bundle created successfully!');
      setBundles(prev => [response.data.data.bundle, ...prev]);
      resetBundleForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create bundle');
    } finally {
      setLoading(false);
    }
  };

  // Add merch item to bundle
  const addMerchItem = () => {
    if (!newMerchItem.name.trim() || !newMerchItem.price || !newMerchItem.image) {
      setError('Name, price, and image are required for merch items');
      return;
    }

    if (editingItem !== null) {
      // Update existing item
      const updatedItems = [...bundleForm.merchItems];
      updatedItems[editingItem] = { ...newMerchItem, price: parseFloat(newMerchItem.price) };
      setBundleForm(prev => ({ ...prev, merchItems: updatedItems }));
      setEditingItem(null);
    } else {
      // Add new item
      setBundleForm(prev => ({
        ...prev,
        merchItems: [...prev.merchItems, { ...newMerchItem, price: parseFloat(newMerchItem.price) }]
      }));
    }

    setNewMerchItem({ name: '', price: '', description: '', image: '' });
  };

  // Edit merch item
  const editMerchItem = (index) => {
    const item = bundleForm.merchItems[index];
    setNewMerchItem({
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      image: item.image
    });
    setEditingItem(index);
  };

  // Remove merch item
  const removeMerchItem = (index) => {
    setBundleForm(prev => ({
      ...prev,
      merchItems: prev.merchItems.filter((_, i) => i !== index)
    }));
  };

  // Add size chart
  const addSizeChart = () => {
    if (!newSizeChart.trim()) {
      setError('Size chart URL is required');
      return;
    }

    setBundleForm(prev => ({
      ...prev,
      sizeCharts: [...prev.sizeCharts, newSizeChart]
    }));
    setNewSizeChart('');
  };

  // Remove size chart
  const removeSizeChart = (index) => {
    setBundleForm(prev => ({
      ...prev,
      sizeCharts: prev.sizeCharts.filter((_, i) => i !== index)
    }));
  };

  // Add combo
  const addCombo = () => {
    if (!newCombo.name.trim() || !newCombo.comboPrice || newCombo.items.length === 0) {
      setError('Combo name, price, and at least one item are required');
      return;
    }

    if (editingCombo !== null) {
      // Update existing combo
      const updatedCombos = [...bundleForm.combos];
      updatedCombos[editingCombo] = { ...newCombo, comboPrice: parseFloat(newCombo.comboPrice) };
      setBundleForm(prev => ({ ...prev, combos: updatedCombos }));
      setEditingCombo(null);
    } else {
      // Add new combo
      setBundleForm(prev => ({
        ...prev,
        combos: [...prev.combos, { ...newCombo, comboPrice: parseFloat(newCombo.comboPrice) }]
      }));
    }

    setNewCombo({ name: '', items: [], comboPrice: '', description: '' });
  };

  // Edit combo
  const editCombo = (index) => {
    const combo = bundleForm.combos[index];
    setNewCombo({
      name: combo.name,
      items: [...combo.items],
      comboPrice: combo.comboPrice.toString(),
      description: combo.description || ''
    });
    setEditingCombo(index);
  };

  // Remove combo
  const removeCombo = (index) => {
    setBundleForm(prev => ({
      ...prev,
      combos: prev.combos.filter((_, i) => i !== index)
    }));
  };

  // Toggle item in combo
  const toggleComboItem = (itemName) => {
    setNewCombo(prev => ({
      ...prev,
      items: prev.items.includes(itemName)
        ? prev.items.filter(item => item !== itemName)
        : [...prev.items, itemName]
    }));
  };

  // Reset bundle form
  const resetBundleForm = () => {
    setBundleForm({
      title: '',
      description: '',
      merchItems: [],
      sizeCharts: [],
      combos: []
    });
    setNewMerchItem({ name: '', price: '', description: '', image: '' });
    setNewCombo({ name: '', items: [], comboPrice: '', description: '' });
    setNewSizeChart('');
    setEditingItem(null);
    setEditingCombo(null);
  };

  // Get status badge
  const getStatusBadge = (status, visibility) => {
    if (status === 'pending') {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    } else if (status === 'approved' && visibility) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Live</span>;
    } else if (status === 'approved' && !visibility) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Hidden</span>;
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(clearMessages, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  if (!storedUser) {
    return <div>Loading...</div>;
  }

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
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Club Coordinator Portal</h1>
                  <p className="text-sm text-gray-500">{storedUser.clubName || storedUser.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Bundle Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Create New Bundle</h2>
            
            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Title *</label>
                <input
                  type="text"
                  value={bundleForm.title}
                  onChange={(e) => setBundleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Summer Collection 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={bundleForm.description}
                  onChange={(e) => setBundleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe your merch bundle..."
                />
              </div>
            </div>

            {/* Merch Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Merch Items *</h3>
              
              {/* Add Merch Item Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-3">{editingItem !== null ? 'Edit Item' : 'Add New Item'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Item Name *"
                    value={newMerchItem.name}
                    onChange={(e) => setNewMerchItem(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Price *"
                    value={newMerchItem.price}
                    onChange={(e) => setNewMerchItem(prev => ({ ...prev, price: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
          </div>
                <textarea
                  placeholder="Description"
                  value={newMerchItem.description}
                  onChange={(e) => setNewMerchItem(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
                
                {/* Image Upload */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Image *</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, 'merch')}
                      className="hidden"
                      id="merch-image-upload"
                    />
                    <label
                      htmlFor="merch-image-upload"
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload Image
                    </label>
                    {newMerchItem.image && (
                      <div className="flex items-center space-x-2">
                        <img src={newMerchItem.image} alt="Preview" className="w-12 h-12 object-cover rounded" />
                        <button
                          onClick={() => setNewMerchItem(prev => ({ ...prev, image: '' }))}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={addMerchItem}
                  disabled={uploadingImage}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {editingItem !== null ? 'Update Item' : 'Add Item'}
                </button>
              </div>

              {/* Merch Items List */}
              {bundleForm.merchItems.length > 0 && (
                <div className="space-y-2">
                  {bundleForm.merchItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">₹{item.price}</p>
                        </div>
                    </div>
                      <div className="flex space-x-2">
                      <button
                          onClick={() => editMerchItem(index)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                          onClick={() => removeMerchItem(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>

            {/* Size Charts */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Size Charts</h3>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-3">
              <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, 'sizeChart')}
                    className="hidden"
                    id="size-chart-upload"
                  />
                  <label
                    htmlFor="size-chart-upload"
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    {uploadingSizeChart ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Size Chart
                  </label>
                  {newSizeChart && (
                    <button
                      onClick={addSizeChart}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  )}
                </div>
                {newSizeChart && (
                  <div className="mt-3 flex items-center space-x-2">
                    <img src={newSizeChart} alt="Size Chart" className="w-20 h-20 object-cover rounded" />
                    <button
                      onClick={() => setNewSizeChart('')}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Size Charts List */}
              {bundleForm.sizeCharts.length > 0 && (
                <div className="space-y-2">
                  {bundleForm.sizeCharts.map((chart, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <img src={chart} alt="Size Chart" className="w-16 h-16 object-cover rounded" />
                      <button
                        onClick={() => removeSizeChart(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Combos */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Combos (Optional)</h3>
              
              {/* Add Combo Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-3">{editingCombo !== null ? 'Edit Combo' : 'Add New Combo'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                    placeholder="Combo Name *"
                    value={newCombo.name}
                    onChange={(e) => setNewCombo(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                    placeholder="Combo Price *"
                    value={newCombo.comboPrice}
                    onChange={(e) => setNewCombo(prev => ({ ...prev, comboPrice: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>
                <textarea
                  placeholder="Combo Description"
                  value={newCombo.description}
                  onChange={(e) => setNewCombo(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
                
                {/* Select Items for Combo */}
                {bundleForm.merchItems.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Items *</label>
                    <div className="flex flex-wrap gap-2">
                      {bundleForm.merchItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => toggleComboItem(item.name)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            newCombo.items.includes(item.name)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={addCombo}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingCombo !== null ? 'Update Combo' : 'Add Combo'}
                </button>
              </div>

              {/* Combos List */}
              {bundleForm.combos.length > 0 && (
                <div className="space-y-2">
                  {bundleForm.combos.map((combo, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{combo.name}</p>
                          <p className="text-sm text-gray-600">₹{combo.comboPrice}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editCombo(index)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeCombo(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{combo.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {combo.items.map((item, itemIndex) => (
                          <span key={itemIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Bundle Button */}
              <button
              onClick={createBundle}
              disabled={loading || bundleForm.merchItems.length === 0}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Bundle...
                </div>
              ) : (
                'Create Bundle'
              )}
              </button>
          </div>

          {/* Existing Bundles */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Your Bundles</h2>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
              </div>
            ) : bundles.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No bundles created yet.</p>
                <p className="text-sm text-gray-400 mt-2">Create your first bundle using the form on the left.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bundles.map((bundle) => (
                  <div key={bundle._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{bundle.title}</h3>
                        <p className="text-sm text-gray-600">{bundle.description}</p>
                      </div>
                      {getStatusBadge(bundle.approvalStatus, bundle.visibility)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Items:</span> {bundle.merchItems.length}
                      </div>
                      <div>
                        <span className="text-gray-500">Combos:</span> {bundle.combos.length}
                      </div>
                      <div>
                        <span className="text-gray-500">Size Charts:</span> {bundle.sizeCharts.length}
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span> {new Date(bundle.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {bundle.approvalStatus === 'approved' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          Approved by: {bundle.approvedBy?.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          Approved on: {new Date(bundle.approvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubCoordinatorPortal;
