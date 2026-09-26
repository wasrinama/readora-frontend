import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Check, X, Eye, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Banners() {
  const { token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFields, setFormFields] = useState({
    title: '',
    textColor: '#ffffff',
    imageUrl: '',
    link: '/books',
    active: true,
    order: '0'
  });

  const fetchBanners = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/banners/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanners(data);
      } else {
        setError('Failed to fetch promotional banners.');
      }
    } catch (err) {
      setError('Network error. Failed to load banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [token]);

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormFields({
      title: 'Mega Summer Sale!',
      textColor: '#ffffff',
      imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200',
      link: '/books?category=Fiction',
      active: true,
      order: '0'
    });
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setIsEditMode(true);
    setEditingId(banner._id);
    setFormFields({
      title: banner.title || '',
      textColor: banner.textColor || '#ffffff',
      imageUrl: banner.imageUrl,
      link: banner.link || '/books',
      active: banner.active !== false,
      order: (banner.order || 0).toString()
    });
    setShowModal(true);
  };

 const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit.');
    return;
  }

  const uploadData = new FormData();
  uploadData.append('image', file);

  try {
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: uploadData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');

    setFormFields(prev => ({
      ...prev,
      imageUrl: data.url
    }));
  } catch (err) {
    alert('Image upload failed: ' + err.message);
  }
};

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formFields.imageUrl.trim()) {
      alert('Please provide a banner image link or upload a file.');
      return;
    }

    const payload = {
      ...formFields,
      order: Number(formFields.order)
    };

    try {
      const url = isEditMode ? `${API_BASE_URL}/banners/${editingId}` : `${API_BASE_URL}/banners`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        flashSuccess(isEditMode ? 'Banner updated successfully.' : 'New banner published.');
        setShowModal(false);
        fetchBanners();
      } else {
        alert(data.message || 'Failed to save banner.');
      }
    } catch (err) {
      alert('Error updating banner.');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        flashSuccess('Banner deleted.');
        fetchBanners();
      } else {
        alert('Failed to delete banner.');
      }
    } catch (err) {
      alert('Error deleting banner.');
    }
  };

  // Quick Active/Inactive Toggle Switch
  const handleToggleActive = async (banner) => {
    try {
      const res = await fetch(`${API_BASE_URL}/banners/${banner._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !banner.active })
      });
      if (res.ok) {
        flashSuccess(`Banner set to ${!banner.active ? 'Active' : 'Inactive'}`);
        fetchBanners();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500 border border-emerald-400 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wide">
            Banner Designs
          </h1>
          <p className="text-xs text-slate-400">Design home page promotional slides and routing links</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-650/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Banner</span>
          </button>
        </div>
      </div>

      {/* Banners List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-slate-500 text-xs py-8 col-span-2 text-center animate-pulse">Retrieving banner slides...</p>
        ) : banners.length === 0 ? (
          <p className="text-slate-500 text-xs py-8 col-span-2 text-center">No promo banners published. Click "New Banner" to create one.</p>
        ) : (
          banners.map((b) => (
            <div key={b._id} className="bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
              
              {/* Image Preview Frame */}
              <div className="h-44 w-full bg-slate-950 relative overflow-hidden group">
                <img 
                  src={b.imageUrl} 
                  alt="" 
                  className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200'}
                />
                {/* Text overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                  <h4 className="font-extrabold text-white text-base tracking-wide uppercase">{b.title}</h4>
                  <p className="text-[10px] text-brand-400 font-mono mt-0.5">Redirect: {b.link}</p>
                </div>

                {/* Status indicator badge */}
                <span className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  b.active !== false
                    ? 'bg-emerald-500/25 border border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}>
                  {b.active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Bottom Actions Row */}
              <div className="p-4 flex items-center justify-between border-t border-slate-850/60 bg-slate-900/30">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Display Order: <span className="text-slate-350">{b.order || 0}</span>
                </span>
                
                <div className="flex gap-2">
                  {/* Toggle Active Switch */}
                  <button
                    onClick={() => handleToggleActive(b)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                      b.active !== false
                        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/15'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
                    }`}
                  >
                    {b.active !== false ? 'Deactivate' : 'Activate'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-all inline-flex"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteBanner(b._id)}
                    className="p-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400 hover:text-rose-300 transition-all inline-flex"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* DESIGNER & EDIT FORM OVERLAY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
                {isEditMode ? 'Modify Banner Design' : 'Publish Promo Banner'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Split layout: Form (left) + Live Banner Designer Preview Frame (right) */}
            <div className="p-6 overflow-y-auto no-scrollbar flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              
              {/* Form panel */}
              <form onSubmit={handleSaveBanner} className="space-y-4">
                
                {/* Title & Text Color Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Title (Takes 2/3 cols) */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Banner Overlay Title (Optional)</label>
                    <input
                      type="text"
                      value={formFields.title}
                      onChange={(e) => setFormFields(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="Leave empty for image-only banner"
                    />
                  </div>
                  {/* Text Color Picker (Takes 1/3 col) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formFields.textColor}
                        onChange={(e) => setFormFields(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-10 h-9 p-0 bg-transparent border-0 cursor-pointer rounded-lg overflow-hidden shrink-0"
                      />
                      <input
                        type="text"
                        value={formFields.textColor}
                        onChange={(e) => setFormFields(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-full px-2 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none font-mono text-[10px] text-center"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

                 {/* Image URL */}
                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <label className="font-bold text-slate-400 uppercase">Banner Image (URL or PC Upload) *</label>
                     <span className="text-[10px] text-brand-400 font-bold uppercase">Base64 Supported</span>
                   </div>
                   <div className="grid grid-cols-1 gap-2">
                     <input
                       type="text"
                       placeholder="Paste Banner Image URL..."
                       value={formFields.imageUrl.startsWith('data:image') ? 'Uploaded from PC (Base64 Binary)' : formFields.imageUrl}
                       onChange={(e) => setFormFields(prev => ({ ...prev, imageUrl: e.target.value }))}
                       className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                     />
                     <div className="flex items-center justify-between gap-3 p-2 bg-slate-950/60 border border-slate-850 rounded-xl">
                       <span className="text-[10px] text-slate-500 font-medium">Upload from PC:</span>
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                       />
                     </div>
                   </div>
                 </div>

                {/* Destination Link */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Redirection Click Link</label>
                  <input
                    type="text"
                    value={formFields.link}
                    onChange={(e) => setFormFields(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                    placeholder="e.g. /offers or /books?category=Kavi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Order */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Display Sort Order</label>
                    <input
                      type="number"
                      min="0"
                      value={formFields.order}
                      onChange={(e) => setFormFields(prev => ({ ...prev, order: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase block mb-1">State</label>
                    <label className="flex items-center gap-2 cursor-pointer mt-2.5">
                      <input
                        type="checkbox"
                        checked={formFields.active}
                        onChange={(e) => setFormFields(prev => ({ ...prev, active: e.target.checked }))}
                        className="h-4.5 w-4.5 rounded bg-slate-950 border-slate-855 text-brand-500 focus:ring-0"
                      />
                      <span className="font-bold text-slate-350">Active Promo</span>
                    </label>
                  </div>
                </div>

                {/* CTA Save */}
                <div className="pt-4 border-t border-slate-850 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl"
                  >
                    Publish Slide
                  </button>
                </div>

              </form>

              {/* Live Preview Panel */}
              <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between space-y-4">
                <span className="text-[9px] uppercase font-bold text-brand-400 tracking-wider">Live Homepage Slider Preview</span>
                
                {/* Live Preview Frame Container */}
                <div className="flex-1 w-full bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden relative flex flex-col justify-end min-h-[220px]">
                  <img 
                    src={formFields.imageUrl} 
                    alt="Design Preview"
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200'}
                  />
                  {/* Slider Content */}
                  {formFields.title && formFields.title.trim() && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <div className="relative z-10 p-6 space-y-3 text-left">
                        <span className="px-2.5 py-1 rounded bg-brand-600 text-white font-extrabold text-[8px] uppercase tracking-widest">Featured Promo</span>
                        <h2 
                          style={{ color: formFields.textColor || '#ffffff' }}
                          className="text-xl font-black leading-tight uppercase font-display max-w-sm drop-shadow-md"
                        >
                          {formFields.title}
                        </h2>
                        <button 
                          type="button"
                          className="px-4 py-2 bg-white text-slate-950 font-bold rounded-xl text-[10px] uppercase shadow-lg shadow-white/10 hover:scale-102 transition-transform pointer-events-none"
                        >
                          Browse Items
                        </button>
                      </div>
                    </>
                  )}

                  {/* Dot navigation indicators */}
                  <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                  </div>
                </div>

                <div className="p-3 bg-slate-900/30 rounded-xl text-[10px] text-slate-500 italic text-center">
                  Preview frame renders standard aspect ratio and hero slider fonts.
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
