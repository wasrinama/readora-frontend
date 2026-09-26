import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Archive, RotateCcw, Trash2, 
  Upload, Download, AlertCircle, Check, X, Filter, ChevronLeft, ChevronRight, Tag, Percent
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function BookManagement() {
  const { token, user } = useAuth();
  
  // Data State
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authorsList, setAuthorsList] = useState([]);
  const [publishersList, setPublishersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Table Controls
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [langFilter, setLangFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('active'); // active, archived, all
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add/Edit Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFields, setFormFields] = useState({
    title: '',
    author: '',
    price: '',
    category: '',
    description: '',
    coverImage: '',
    imagesInput: '', // comma-separated URL string
    tamilTitle: '',
    englishTitle: '',
    sinhalaTitle: '',
    discount: '0',
    discountPercent: '0',
    finalPrice: '',
    isOffer: false,
    stock: '10',
    language: 'English',
    publisher: '',
    pages: '0',
    publishYear: new Date().getFullYear().toString(),
    isbn: '',
    availabilityStatus: 'In Stock',
    featured: false,
    bestSeller: false,
    newArrival: false,
    status: 'active'
  });

  // Bulk Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  // Fetch all books (admin view includes archived)
  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/books/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setError('Failed to fetch admin catalog.');
      }
    } catch (err) {
      setError('Network error. Failed to load books.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for the select input
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.warn('Failed to load categories', err);
    }
  };

  // Fetch authors for datalist suggestions
  const fetchAuthors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/authors`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAuthorsList(data);
      }
    } catch (err) {
      console.warn('Failed to load authors', err);
    }
  };

  // Fetch publishers for datalist suggestions
  const fetchPublishers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/publishers`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPublishersList(data);
      }
    } catch (err) {
      console.warn('Failed to load publishers', err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchAuthors();
    fetchPublishers();
  }, [token]);

  // Flash toast alert messages helper
  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Archive a book
  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this book? It will be hidden from the customer storefront.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/books/${id}/archive`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        flashSuccess('Book archived successfully!');
        fetchBooks();
      } else {
        alert('Failed to archive book.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  // Restore an archived book
  const handleRestore = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/books/${id}/restore`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        flashSuccess('Book restored successfully!');
        fetchBooks();
      } else {
        alert('Failed to restore book.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  // Delete a book permanently
  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL: Are you sure you want to PERMANENTLY DELETE this book? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        flashSuccess('Book deleted permanently.');
        fetchBooks();
      } else {
        alert('Failed to delete book. Only super admins or admins can perform this action.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  // Open form modal for creating new book
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormFields({
      title: '',
      author: '',
      price: '',
      category: categories[0]?.name || 'Fiction',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
      imagesInput: '',
      tamilTitle: '',
      englishTitle: '',
      sinhalaTitle: '',
      discount: '0',
      discountPercent: '0',
      finalPrice: '',
      isOffer: false,
      stock: '10',
      language: 'English',
      publisher: '',
      pages: '0',
      publishYear: new Date().getFullYear().toString(),
      isbn: '',
      availabilityStatus: 'In Stock',
      featured: false,
      bestSeller: false,
      newArrival: false,
      status: 'active'
    });
    setShowModal(true);
  };

  // Open form modal for editing book
  const openEditModal = (book) => {
    setIsEditMode(true);
    setEditingId(book._id);
    const p = book.price !== undefined ? Number(book.price) : 0;
    const d = book.discount !== undefined ? Number(book.discount) : 0;
    let dp = book.discountPercent !== undefined ? Number(book.discountPercent) : 0;
    if (!dp && p > 0 && d > 0) {
      dp = Math.round((d / p) * 100);
    }
    const fp = p > 0 ? (d > 0 ? Math.max(0, p - d) : (dp > 0 ? Math.round(p * (1 - dp / 100)) : p)) : '';

    setFormFields({
      title: book.title || '',
      author: book.author || '',
      price: book.price !== undefined ? book.price.toString() : '',
      category: book.category || '',
      description: book.description || '',
      coverImage: book.coverImage || '',
      imagesInput: Array.isArray(book.images) ? book.images.join(', ') : '',
      tamilTitle: book.tamilTitle || '',
      englishTitle: book.englishTitle || '',
      sinhalaTitle: book.sinhalaTitle || '',
      discount: d.toString(),
      discountPercent: dp.toString(),
      finalPrice: fp.toString(),
      isOffer: book.isOffer || d > 0 || dp > 0 || book.category === 'Offers' || false,
      stock: book.stock !== undefined ? book.stock.toString() : '10',
      language: book.language || 'English',
      publisher: book.publisher || '',
      pages: book.pages !== undefined ? book.pages.toString() : '0',
      publishYear: book.publishYear !== undefined ? book.publishYear.toString() : new Date().getFullYear().toString(),
      isbn: book.isbn || '',
      availabilityStatus: book.availabilityStatus || 'In Stock',
      featured: book.featured === true,
      bestSeller: book.bestSeller === true,
      newArrival: book.newArrival === true,
      status: book.status || 'active'
    });
    setShowModal(true);
  };

  // 2-Way Pricing & Discount Auto-Calculation
  const handlePriceChange = (val) => {
    const p = parseFloat(val) || 0;
    const dp = parseFloat(formFields.discountPercent) || 0;
    let d = 0;
    let fp = p;
    if (dp > 0 && p > 0) {
      d = Math.round(p * (dp / 100) * 100) / 100;
      fp = Math.max(0, Math.round((p - d) * 100) / 100);
    } else {
      const currentD = parseFloat(formFields.discount) || 0;
      if (currentD > 0 && p > 0) {
        d = currentD;
        fp = Math.max(0, Math.round((p - d) * 100) / 100);
      }
    }
    setFormFields(prev => ({
      ...prev,
      price: val,
      discount: d > 0 ? d.toString() : '0',
      finalPrice: fp > 0 ? fp.toString() : '',
      isOffer: dp > 0 || d > 0 ? true : prev.isOffer
    }));
  };

  const handleDiscountPercentChange = (val) => {
    const dp = parseFloat(val) || 0;
    const p = parseFloat(formFields.price) || 0;
    let d = 0;
    let fp = p;
    if (p > 0 && dp > 0) {
      d = Math.round(p * (dp / 100) * 100) / 100;
      fp = Math.max(0, Math.round((p - d) * 100) / 100);
    }
    setFormFields(prev => ({
      ...prev,
      discountPercent: val,
      discount: d.toString(),
      finalPrice: fp > 0 ? fp.toString() : '',
      isOffer: dp > 0 ? true : prev.isOffer
    }));
  };

  const handleDiscountAmountChange = (val) => {
    const d = parseFloat(val) || 0;
    const p = parseFloat(formFields.price) || 0;
    let dp = 0;
    let fp = p;
    if (p > 0 && d > 0) {
      dp = Math.round((d / p) * 100);
      fp = Math.max(0, Math.round((p - d) * 100) / 100);
    }
    setFormFields(prev => ({
      ...prev,
      discount: val,
      discountPercent: dp.toString(),
      finalPrice: fp > 0 ? fp.toString() : '',
      isOffer: d > 0 ? true : prev.isOffer
    }));
  };

  const handleFinalPriceChange = (val) => {
    const fp = parseFloat(val) || 0;
    const p = parseFloat(formFields.price) || 0;
    let d = 0;
    let dp = 0;
    if (p > 0 && fp >= 0 && fp < p) {
      d = Math.round((p - fp) * 100) / 100;
      dp = Math.round((d / p) * 100);
    }
    setFormFields(prev => ({
      ...prev,
      finalPrice: val,
      discount: d.toString(),
      discountPercent: dp.toString(),
      isOffer: d > 0 ? true : prev.isOffer
    }));
  };

  const handleCoverUpload = async (e) => {
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
        coverImage: data.url
      }));
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    }
  };

  // Save Book Form (Add/Update)
  const handleSaveBook = async (e) => {
    e.preventDefault();
    const { title, author, price, category, description, coverImage } = formFields;
    
    if (!title.trim() || !author.trim() || !price || !category.trim() || !description.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const numPrice = Number(price);
    const numDiscount = Number(formFields.discount || 0);
    let numDiscountPercent = Number(formFields.discountPercent || 0);
    if (!numDiscountPercent && numPrice > 0 && numDiscount > 0) {
      numDiscountPercent = Math.round((numDiscount / numPrice) * 100);
    }
    const boolIsOffer = formFields.isOffer === true || numDiscount > 0 || numDiscountPercent > 0 || formFields.category === 'Offers';

    const payload = {
      ...formFields,
      price: numPrice,
      discount: numDiscount,
      discountPercent: numDiscountPercent,
      isOffer: boolIsOffer,
      stock: Number(formFields.stock),
      pages: Number(formFields.pages),
      publishYear: Number(formFields.publishYear),
      images: formFields.imagesInput.split(',').map(s => s.trim()).filter(Boolean)
    };
    delete payload.imagesInput;
    delete payload.finalPrice;

    try {
      const url = isEditMode ? `${API_BASE_URL}/books/${editingId}` : `${API_BASE_URL}/books`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        flashSuccess(isEditMode ? 'Book details updated successfully!' : 'New book added to catalog.');
        setShowModal(false);
        fetchBooks();
      } else {
        const errJson = await res.json();
        alert(errJson.message || 'Failed to save book.');
      }
    } catch (err) {
      alert('Network error. Failed to save book.');
    }
  };

  // Handle Bulk Import
  const handleBulkImport = async () => {
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('Please enter a JSON list of books.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        setImportError('Payload must be a JSON array of book objects.');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/books/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ books: parsed })
      });

      const resJson = await res.json();
      if (res.ok) {
        flashSuccess(resJson.message);
        setShowImportModal(false);
        setImportJsonText('');
        fetchBooks();
      } else {
        setImportError(resJson.message || 'Import failed.');
      }
    } catch (err) {
      setImportError('Invalid JSON formatting. Check your brackets and quotes.');
    }
  };

  // Filter Logic
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      (book.isbn && book.isbn.includes(search));

    const matchesCat = catFilter === 'All' 
      ? true 
      : catFilter === 'Offers' 
      ? (Number(book.discount) > 0 || Number(book.discountPercent) > 0 || book.isOffer === true || (book.category && (book.category.toLowerCase() === 'offers' || book.category.toLowerCase() === 'special offers')))
      : book.category === catFilter;

    const matchesLang = langFilter === 'All' || book.language === langFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = book.status !== 'archived';
    else if (statusFilter === 'archived') matchesStatus = book.status === 'archived';

    return matchesSearch && matchesCat && matchesLang && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Toast alert box */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500 border border-emerald-400 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wide">
            Book Catalog Manager
          </h1>
          <p className="text-xs text-slate-400">Create, update, archive, and import catalog books</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Upload className="h-4 w-4" />
            <span>Bulk Import</span>
          </button>
          <button 
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-650/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-3xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search title, author, ISBN..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Category */}
        <select
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setCurrentPage(1); }}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 text-xs focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Offers">Special Offers & Deals 🔥</option>
          {categories.map(c => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Language */}
        <select
          value={langFilter}
          onChange={(e) => { setLangFilter(e.target.value); setCurrentPage(1); }}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 text-xs focus:outline-none"
        >
          <option value="All">All Languages</option>
          <option value="English">English</option>
          <option value="Tamil">Tamil</option>
          <option value="Sinhala">Sinhala</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 text-xs focus:outline-none"
        >
          <option value="active">Active Books Only</option>
          <option value="archived">Archived Books Only</option>
          <option value="all">All (Active & Archived)</option>
        </select>

      </div>

      {/* Main Books Catalog Table */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4 w-12">Cover</th>
                <th className="p-4">Book Details</th>
                <th className="p-4">Language</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">Loading catalog items...</td>
                </tr>
              ) : paginatedBooks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">No books match your filtering options.</td>
                </tr>
              ) : (
                paginatedBooks.map((book) => (
                  <tr key={book._id} className="border-b border-slate-850/40 hover:bg-slate-800/10 transition-colors">
                    {/* Cover image */}
                    <td className="p-4">
                      <img 
                        src={book.coverImage} 
                        alt="" 
                        className="h-10 w-8 object-cover rounded shadow-md"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'}
                      />
                    </td>
                    {/* Book title and author */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-200 text-sm max-w-[240px] truncate">{book.title}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">by {book.author}</p>
                        {book.isbn && <p className="text-[9px] text-brand-400">ISBN: {book.isbn}</p>}
                      </div>
                    </td>
                    {/* Language */}
                    <td className="p-4 font-medium text-slate-350">{book.language}</td>
                    {/* Category */}
                    <td className="p-4 text-slate-400">{book.category}</td>
                    {/* Price and discount */}
                    <td className="p-4 text-right font-bold text-slate-100">
                      <div>
                        {Number(book.discount) > 0 || Number(book.discountPercent) > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] line-through text-slate-500">Rs.{book.price}</span>
                            <span className="text-emerald-400 font-extrabold">
                              Rs.{(book.price - (Number(book.discount) || (book.price * Number(book.discountPercent || 0) / 100))).toFixed(0)}
                            </span>
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 mt-0.5">
                              {book.discountPercent || (book.price > 0 ? Math.round((book.discount / book.price) * 100) : 0)}% OFF
                            </span>
                          </div>
                        ) : (
                          <span>Rs.{book.price}</span>
                        )}
                      </div>
                    </td>
                    {/* Stock level */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        book.stock === 0 
                          ? 'bg-rose-500/10 text-rose-400' 
                          : book.stock <= 5 
                          ? 'bg-amber-500/10 text-amber-400 animate-pulse' 
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {book.stock}
                      </span>
                    </td>
                    {/* Status Pill */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        book.status === 'archived'
                          ? 'bg-slate-800 text-slate-500 border border-slate-750'
                          : 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/10'
                      }`}>
                        {book.status || 'active'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="p-4 text-right space-x-1.5 shrink-0">
                      <button 
                        onClick={() => openEditModal(book)}
                        title="Edit Book Details"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {book.status === 'archived' ? (
                        <button 
                          onClick={() => handleRestore(book._id)}
                          title="Restore Book to Store"
                          className="p-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-450 hover:text-emerald-300 transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleArchive(book._id)}
                          title="Archive Book"
                          className="p-2 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-450 hover:text-amber-300 transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(book._id)}
                        title="Delete Permanently"
                        className="p-2 rounded-lg bg-rose-950 hover:bg-rose-900/60 text-rose-450 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-900/40 p-4 border-t border-slate-850 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Showing page {currentPage} of {totalPages} ({filteredBooks.length} books found)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE & EDIT FORM OVERLAY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between shrink-0">
              <h3 className="text-md font-bold font-display uppercase tracking-wider text-slate-200">
                {isEditMode ? 'Modify Book Details' : 'Add New Book to Store'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-450 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form scroll viewport */}
            <form onSubmit={handleSaveBook} className="p-6 space-y-6 overflow-y-auto flex-1 no-scrollbar text-xs">
              
              {/* Basic Details Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-brand-400 uppercase tracking-widest text-[9px] border-b border-slate-850 pb-1">1. Basic Book Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Title (Display Name) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Book Display Title *</label>
                    <input
                      type="text"
                      required
                      value={formFields.title}
                      onChange={(e) => setFormFields(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      placeholder="e.g. Madol Doova"
                    />
                  </div>

                  {/* Author */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Author *</label>
                    <input
                      type="text"
                      required
                      list="authors-datalist"
                      value={formFields.author}
                      onChange={(e) => setFormFields(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      placeholder="e.g. Martin Wickramasinghe"
                    />
                    <datalist id="authors-datalist">
                      {authorsList.map(a => (
                        <option key={a._id} value={a.name} />
                      ))}
                    </datalist>
                  </div>

                </div>
              </div>

              {/* Translation Multi-Language Titles Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-brand-400 uppercase tracking-widest text-[9px] border-b border-slate-850 pb-1">2. Translated Titles (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tamil */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Tamil Title</label>
                    <input
                      type="text"
                      value={formFields.tamilTitle}
                      onChange={(e) => setFormFields(prev => ({ ...prev, tamilTitle: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="தமிழ் தலைப்பு"
                    />
                  </div>
                  {/* English */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">English Title</label>
                    <input
                      type="text"
                      value={formFields.englishTitle}
                      onChange={(e) => setFormFields(prev => ({ ...prev, englishTitle: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="English Title"
                    />
                  </div>
                  {/* Sinhala */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Sinhala Title</label>
                    <input
                      type="text"
                      value={formFields.sinhalaTitle}
                      onChange={(e) => setFormFields(prev => ({ ...prev, sinhalaTitle: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="සිංහල මාතෘකාව"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing, Discount, Stock, Language, Category */}
              <div className="space-y-4">
                <h4 className="font-bold text-brand-400 uppercase tracking-widest text-[9px] border-b border-slate-850 pb-1">3. Inventory & Pricing</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Category *</label>
                    <select
                      value={formFields.category}
                      onChange={(e) => setFormFields(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 focus:outline-none"
                    >
                      <option value="Offers">Special Offers & Deals 🔥</option>
                      {categories.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Language</label>
                    <select
                      value={formFields.language}
                      onChange={(e) => setFormFields(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 focus:outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Sinhala">Sinhala</option>
                    </select>
                  </div>

                  {/* Stock */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Stock Units</label>
                    <input
                      type="number"
                      min="0"
                      value={formFields.stock}
                      onChange={(e) => setFormFields(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="15"
                    />
                  </div>
                </div>

                {/* Modern Pricing & Discount Auto-Calculator */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="h-4 w-4" />
                      <span>Pricing & Discount Calculator</span>
                    </label>
                    {parseFloat(formFields.discount) > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {formFields.discountPercent}% OFF • Save Rs. {formFields.discount}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Actual Price */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase">Actual Price (LKR) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        value={formFields.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder="e.g. 3450"
                      />
                    </div>

                    {/* Discount Percentage */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase">Discount (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={formFields.discountPercent}
                          onChange={(e) => handleDiscountPercentChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                          placeholder="e.g. 15"
                        />
                        <span className="absolute right-3.5 top-2.5 text-slate-500 text-sm font-bold">%</span>
                      </div>
                    </div>

                    {/* Discount Amount */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase">Discount (LKR)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formFields.discount}
                        onChange={(e) => handleDiscountAmountChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder="e.g. 511"
                      />
                    </div>

                    {/* After Discount Price */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-emerald-400 uppercase">After Discount (LKR)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formFields.finalPrice}
                        onChange={(e) => handleFinalPriceChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="e.g. 2939"
                      />
                    </div>
                  </div>

                  {/* Special Offers Inclusion Option */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800/60">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formFields.isOffer}
                        onChange={(e) => setFormFields(prev => ({ ...prev, isOffer: e.target.checked }))}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-300">
                        Include in <span className="text-amber-400 font-bold">Special Offers</span> Catalog (book appears in both its category and Offers)
                      </span>
                    </label>
                    {parseFloat(formFields.price) > 0 && (
                      <span className="text-[11px] text-slate-400">
                        Customer pays: <strong className="text-emerald-400 font-display font-bold">Rs. {formFields.finalPrice || formFields.price}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Publisher, ISBN, Year, Pages */}
              <div className="space-y-4">
                <h4 className="font-bold text-brand-400 uppercase tracking-widest text-[9px] border-b border-slate-850 pb-1">4. Metadata & Publisher</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Publisher */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Publisher</label>
                    <input
                      type="text"
                      list="publishers-datalist"
                      value={formFields.publisher}
                      onChange={(e) => setFormFields(prev => ({ ...prev, publisher: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="Sarasavi Publishers"
                    />
                    <datalist id="publishers-datalist">
                      {publishersList.map(p => (
                        <option key={p._id} value={p.name} />
                      ))}
                    </datalist>
                  </div>
                  {/* Pages */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Pages</label>
                    <input
                      type="number"
                      min="0"
                      value={formFields.pages}
                      onChange={(e) => setFormFields(prev => ({ ...prev, pages: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="280"
                    />
                  </div>
                  {/* Publish Year */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Publish Year</label>
                    <input
                      type="number"
                      min="1800"
                      value={formFields.publishYear}
                      onChange={(e) => setFormFields(prev => ({ ...prev, publishYear: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                    />
                  </div>
                  {/* ISBN */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">ISBN Number</label>
                    <input
                      type="text"
                      value={formFields.isbn}
                      onChange={(e) => setFormFields(prev => ({ ...prev, isbn: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="978-955-30-1234-5"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image & Image gallery list */}
              <div className="space-y-4">
                <h4 className="font-bold text-brand-400 uppercase tracking-widest text-[9px] border-b border-slate-850 pb-1">5. Images Gallery</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Cover */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-400 uppercase tracking-wider">Cover Image (URL or PC Upload) *</label>
                      <span className="text-[10px] text-brand-400 font-bold uppercase">Base64 Supported</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="Paste Cover Image URL..."
                        value={formFields.coverImage.startsWith('data:image') ? 'Uploaded from PC (Base64 Binary)' : formFields.coverImage}
                        onChange={(e) => setFormFields(prev => ({ ...prev, coverImage: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      />
                      <div className="flex items-center justify-between gap-3 p-2 bg-slate-950/60 border border-slate-850 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-medium">Upload from PC:</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>
                    {formFields.coverImage && (
                      <div className="mt-2.5 p-2 bg-slate-900/30 rounded-xl border border-slate-850/40 flex items-center gap-3">
                        <img 
                          src={formFields.coverImage} 
                          alt="Cover Preview" 
                          className="h-14 w-10 object-cover rounded shadow-md border border-slate-800"
                          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'}
                        />
                        <div className="text-[10px]">
                          <p className="font-bold text-slate-350">Thumbnail Preview</p>
                          <button
                            type="button"
                            onClick={() => setFormFields(prev => ({ ...prev, coverImage: '' }))}
                            className="text-rose-450 hover:underline mt-0.5"
                          >
                            Remove Cover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Multiple Gallery */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Additional Gallery Images (Comma-separated URLs)</label>
                    <input
                      type="text"
                      value={formFields.imagesInput}
                      onChange={(e) => setFormFields(prev => ({ ...prev, imagesInput: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                      placeholder="http://img1.jpg, http://img2.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Book Description *</label>
                <textarea
                  rows="4"
                  required
                  value={formFields.description}
                  onChange={(e) => setFormFields(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  placeholder="Enter book summary or synopsis..."
                />
              </div>

              {/* Flags / Switches */}
              <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex flex-wrap gap-6 items-center">
                
                {/* Featured */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFields.featured}
                    onChange={(e) => setFormFields(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 rounded bg-slate-950 border-slate-850 text-brand-500 focus:ring-0"
                  />
                  <span className="font-bold text-slate-350">Featured (Home Carousel)</span>
                </label>

                {/* Best Seller */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFields.bestSeller}
                    onChange={(e) => setFormFields(prev => ({ ...prev, bestSeller: e.target.checked }))}
                    className="h-4 w-4 rounded bg-slate-950 border-slate-850 text-brand-500 focus:ring-0"
                  />
                  <span className="font-bold text-slate-350">Best Seller Tag</span>
                </label>

                {/* New Arrival */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFields.newArrival}
                    onChange={(e) => setFormFields(prev => ({ ...prev, newArrival: e.target.checked }))}
                    className="h-4 w-4 rounded bg-slate-950 border-slate-850 text-brand-500 focus:ring-0"
                  />
                  <span className="font-bold text-slate-350">New Arrival Tag</span>
                </label>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-850 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-450 hover:text-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-600/10 transition-all active:scale-95"
                >
                  {isEditMode ? 'Update Catalog' : 'Publish Book'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 space-y-4 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Upload className="h-4.5 w-4.5 text-brand-400" />
                <span>Bulk Import Books Array</span>
              </h3>
              <button 
                onClick={() => { setShowImportModal(false); setImportError(''); }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-450"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {importError && (
              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-350 font-semibold flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paste JSON Catalog Array</label>
              <textarea
                rows="8"
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[\n  {\n    "title": "Example Book",\n    "author": "Example Author",\n    "price": 850,\n    "category": "Fiction",\n    "description": "Synopsis here"\n  }\n]'
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/50 no-scrollbar"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportError(''); }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Confirm Import
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}