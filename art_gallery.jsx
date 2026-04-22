import React, { useState, useEffect } from 'react';
import { Heart, Upload, Search, Trash2, Tag } from 'lucide-react';

export default function ArtGallery() {
  const [artworks, setArtworks] = useState([
    {
      id: 1,
      title: 'Moonlit Dreams',
      artist: 'Sarah Chen',
      image: 'https://images.unsplash.com/photo-1577720643272-265e434e4ed6?w=400&h=400&fit=crop',
      likes: 234,
      liked: false,
      hashtags: ['#abstract', '#digital', '#moonlight'],
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      title: 'Urban Canvas',
      artist: 'Marcus Rio',
      image: 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=400&h=400&fit=crop',
      likes: 189,
      liked: false,
      hashtags: ['#urban', '#modern', '#street'],
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      title: 'Nature\'s Palette',
      artist: 'Emma Walker',
      image: 'https://images.unsplash.com/photo-1561214115-6d2f1b0b4a29?w=400&h=400&fit=crop',
      likes: 412,
      liked: false,
      hashtags: ['#nature', '#watercolor', '#landscape'],
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [searchHistory, setSearchHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newArtwork, setNewArtwork] = useState({
    title: '',
    artist: '',
    hashtags: '',
    image: null,
    imagePreview: null,
  });

  // Get all unique hashtags
  const allHashtags = [...new Set(artworks.flatMap(art => art.hashtags))];

  // Filter artworks
  const filteredArtworks = artworks.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         art.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHashtag = !selectedHashtag || art.hashtags.includes(selectedHashtag);
    return matchesSearch && matchesHashtag;
  });

  // Get recommended artworks based on search history
  const getRecommendations = () => {
    if (searchHistory.length === 0) return [];
    
    const recentSearches = searchHistory.slice(-3);
    const recommendedIds = new Set();

    recentSearches.forEach(search => {
      artworks.forEach(art => {
        if ((art.title.toLowerCase().includes(search.toLowerCase()) ||
             art.artist.toLowerCase().includes(search.toLowerCase())) &&
            !filteredArtworks.some(f => f.id === art.id)) {
          recommendedIds.add(art.id);
        }
      });
    });

    return Array.from(recommendedIds)
      .map(id => artworks.find(art => art.id === id))
      .slice(0, 4);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewArtwork({
          ...newArtwork,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      setSearchHistory(prev => [...prev.filter(s => s !== term), term]);
    }
  };

  const handleLike = (id) => {
    setArtworks(prev => prev.map(art => 
      art.id === id 
        ? { ...art, liked: !art.liked, likes: art.liked ? art.likes - 1 : art.likes + 1 }
        : art
    ));
  };

  const handleUpload = () => {
    if (newArtwork.title && newArtwork.artist && newArtwork.imagePreview) {
      const hashtagArray = newArtwork.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      const artwork = {
        id: Math.max(...artworks.map(a => a.id), 0) + 1,
        title: newArtwork.title,
        artist: newArtwork.artist,
        image: newArtwork.imagePreview,
        likes: 0,
        liked: false,
        hashtags: hashtagArray.length > 0 ? hashtagArray : ['#art'],
        uploadedAt: new Date(),
      };

      setArtworks(prev => [artwork, ...prev]);
      setNewArtwork({ title: '', artist: '', hashtags: '', image: null, imagePreview: null });
      setShowUploadModal(false);
    }
  };

  const handleDelete = (id) => {
    setArtworks(prev => prev.filter(art => art.id !== id));
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                ARTISTRY
              </h1>
              <p className="text-slate-400 text-sm tracking-widest mt-2">Discover & Share Creative Works</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Upload size={20} />
              Upload Art
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by artist or title..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Hashtag Filter */}
      {allHashtags.length > 0 && (
        <div className="bg-slate-800/50 border-b border-slate-700/30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <Tag size={16} className="text-slate-400 flex-shrink-0" />
              <button
                onClick={() => setSelectedHashtag('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedHashtag === ''
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {allHashtags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedHashtag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedHashtag === tag
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Recommendations Section */}
        {recommendations.length > 0 && searchHistory.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-400"></span>
              Recommended For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(art => (
                <div
                  key={art.id}
                  className="group bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-700">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-purple-400 font-semibold mb-1">RECOMMENDED</p>
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{art.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{art.artist}</p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleLike(art.id)}
                        className={`flex items-center gap-2 transition-all ${
                          art.liked
                            ? 'text-pink-500'
                            : 'text-slate-400 hover:text-pink-500'
                        }`}
                      >
                        <Heart size={18} fill={art.liked ? 'currentColor' : 'none'} />
                        <span className="text-sm font-medium">{art.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="border-slate-700/30 my-12" />
          </section>
        )}

        {/* Main Gallery */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-400"></span>
            {selectedHashtag ? `Artworks tagged ${selectedHashtag}` : 'Gallery'}
          </h2>

          {filteredArtworks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg">No artworks found. Try a different search or upload one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredArtworks.map(art => (
                <div
                  key={art.id}
                  className="group bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-700">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{art.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{art.artist}</p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {art.hashtags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedHashtag(tag)}
                          className="text-xs bg-slate-700/50 hover:bg-purple-500/30 text-purple-300 px-2 py-1 rounded transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <button
                        onClick={() => handleLike(art.id)}
                        className={`flex items-center gap-2 transition-all ${
                          art.liked
                            ? 'text-pink-500'
                            : 'text-slate-400 hover:text-pink-500'
                        }`}
                      >
                        <Heart size={18} fill={art.liked ? 'currentColor' : 'none'} />
                        <span className="text-sm font-medium">{art.likes}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Upload Your Art</h2>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Upload Image</label>
                <div className="relative border-2 border-dashed border-slate-600 rounded-lg p-6 hover:border-purple-500 transition-colors cursor-pointer bg-slate-700/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {newArtwork.imagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-slate-600">
                  <img 
                    src={newArtwork.imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => setNewArtwork({ ...newArtwork, image: null, imagePreview: null })}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newArtwork.title}
                  onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                  placeholder="Give your artwork a title"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Artist Name</label>
                <input
                  type="text"
                  value={newArtwork.artist}
                  onChange={(e) => setNewArtwork({ ...newArtwork, artist: e.target.value })}
                  placeholder="Your name or pseudonym"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Hashtags (comma-separated)</label>
                <input
                  type="text"
                  value={newArtwork.hashtags}
                  onChange={(e) => setNewArtwork({ ...newArtwork, hashtags: e.target.value })}
                  placeholder="#abstract, #digital, #art"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!newArtwork.imagePreview || !newArtwork.title || !newArtwork.artist}
                className={`flex-1 text-white px-4 py-2 rounded-lg font-semibold transition-all transform ${
                  newArtwork.imagePreview && newArtwork.title && newArtwork.artist
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 hover:scale-105'
                    : 'bg-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
