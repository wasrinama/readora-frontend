import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import { API_BASE_URL } from '../config';
import { useWishlist } from '../context/WishlistContext';

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const { wishlistItems } = useWishlist();
  const showWishlistOnly = searchParams.get('wishlist') === 'true';
  
  // Search, Category and Language state synchronized with URL search params
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedLanguage = searchParams.get('language') || 'All';
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const desiredOrder = [
              'Fiction',
              'Non Fiction',
              'Kavi (Poem)',
              'Children\'s Books',
              'Competitive Exams',
              'School Books',
              'Magazines',
              'Gifts',
              'Stationery'
            ];
            const sortedNames = data
              .map(c => c.name)
              .sort((a, b) => {
                let idxA = desiredOrder.indexOf(a);
                let idxB = desiredOrder.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
              });
            setCategories(['All', 'Special Offers', ...sortedNames]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic categories in Books page:", err);
      }
    };
    fetchCategories();
  }, []);
  const languages = [
    { code: 'All', label: 'Shop All' },
    { code: 'Tamil', label: 'Tamil' },
    { code: 'English', label: 'English' },
    { code: 'Sinhala', label: 'Sinhala' }
  ];

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const fetchBooks = async (pageNum = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      let url = `${API_BASE_URL}/books`;
      const params = [`page=${pageNum}`, 'limit=12'];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (selectedCategory && selectedCategory !== 'All') params.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (selectedLanguage && selectedLanguage !== 'All') params.push(`language=${encodeURIComponent(selectedLanguage)}`);
      
      url += `?${params.join('&')}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setBooks(data);
          setTotalBooks(data.length);
          setTotalPages(1);
        } else {
          const incoming = data.books || [];
          setBooks(prev => (append ? [...prev, ...incoming] : incoming));
          setTotalPages(data.totalPages || 1);
          setTotalBooks(data.totalBooks || incoming.length);
        }
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      if (!append) setBooks([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (showWishlistOnly) {
      setBooks(wishlistItems);
      setTotalBooks(wishlistItems.length);
      setLoading(false);
      return;
    }

    setPage(1);
    fetchBooks(1, false);
  }, [searchQuery, selectedCategory, selectedLanguage, showWishlistOnly, wishlistItems]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBooks(nextPage, true);
    }
  };

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  const handleLanguageChange = (lang) => {
    const params = new URLSearchParams(searchParams);
    if (lang === 'All') {
      params.delete('language');
    } else {
      params.set('language', lang);
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      params.set('search', localSearch.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 light:from-slate-800 light:to-slate-900">
            {showWishlistOnly ? 'My Wishlist' : 'Literature Catalogue'}
          </h1>
          <p className="text-sm text-slate-400 light:text-slate-500 mt-1">
            {showWishlistOnly 
              ? `Showing ${books.length} saved books in your wishlist`
              : totalBooks > 0
                ? `Showing ${books.length} of ${totalBooks} books available for fast ordering`
                : `Showing ${books.length} books available for fast ordering`
            }
          </p>
        </div>

        {/* Live Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search catalog..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </form>
      </div>

      {/* Language Selector Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {languages.map((lang) => {
          const isActive = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 transform active:scale-95 border ${
                isActive
                  ? 'bg-[#1b2a4a] text-[#facc15] border-[#facc15] font-bold shadow-md shadow-brand-500/10 light:bg-[#1d2d50] light:text-[#ffd700] light:border-transparent'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white light:bg-white light:text-[#1d2d50] light:border-[#1d2d50] light:hover:bg-[#1d2d50]/10 shadow-sm'
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filter Menu */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-28">
          <div className="glass-card p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4 font-semibold text-slate-200 light:text-slate-800 border-b border-white/5 pb-3">
              <Filter className="h-4 w-4 text-brand-400" />
              <span>Browse Categories</span>
            </div>
            
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar lg:overflow-visible py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-auto lg:w-full text-center lg:text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 hover:bg-white/5 lg:hover:translate-x-1 ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white font-bold hover:bg-brand-500 shadow-md shadow-brand-600/10'
                      : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Books Catalog Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="h-[450px] rounded-2xl border border-white/5 bg-white/5 shimmer" />
              ))}
            </div>
          ) : books.length > 0 ? (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {books.map((book) => (
                    <motion.div
                      key={book._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {!showWishlistOnly && page < totalPages && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-brand-500/25 active:scale-95 disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading More Books...' : `Load More Books (${books.length} of ${totalBooks})`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 glass-card p-10 flex flex-col items-center justify-center border border-white/5">
              <BookOpen className="h-16 w-16 text-slate-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-300 light:text-slate-800">No books found</h3>
              <p className="text-sm text-slate-400 light:text-slate-500 mt-1 max-w-sm">
                We couldn't find matches for "{searchQuery}". Try selecting another category or typing different keywords.
              </p>
              <button 
                onClick={() => setSearchParams({})} 
                className="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
