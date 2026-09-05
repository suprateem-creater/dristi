import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from './CoupleContext';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import {
  Save, ImagePlus, Loader2, Plus, Trash2, Check, Copy, ExternalLink,
  Sparkles, Download, Upload, Calendar, MapPin, Star, Compass, Heart,
  Lock, BookOpen, Music, Image as ImageIcon, ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { compressImageToDataUrl } from './utils/imageCompressor';

// Sanitize state for Firestore payload
function sanitizeForFirestore(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned;
}

// Convert date to YYYY-MM-DD for native date input
function toInputDateFormat(dateVal) {
  if (!dateVal) return '';
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert YYYY-MM-DD to human readable string
function toDisplayDateFormat(isoDateStr) {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-');
  if (parts.length !== 3) return isoDateStr;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return isoDateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const POPULAR_CITIES = [
  { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { name: "Rome, Italy", lat: 41.9028, lng: 12.4964 },
  { name: "New York, USA", lat: 40.7128, lng: -74.0060 },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
  { name: "Venice, Italy", lat: 45.4408, lng: 12.3155 },
  { name: "Santorini, Greece", lat: 36.3932, lng: 25.4615 },
  { name: "Kyoto, Japan", lat: 35.0116, lng: 135.7681 },
  { name: "Barcelona, Spain", lat: 41.3851, lng: 2.1734 },
  { name: "Bali, Indonesia", lat: -8.4095, lng: 115.1889 },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "San Francisco, USA", lat: 37.7749, lng: -122.4194 },
];

const CONSTELLATION_PRESETS = {
  heart: [
    { id: 1, x: 50, y: 80, label: "The Spark", date: "Where It Began", story: "The bottom point of our heart." },
    { id: 2, x: 26, y: 52, label: "First Whisper", date: "A Shared Secret", story: "Soft words exchanged." },
    { id: 3, x: 18, y: 28, label: "Left Peak", date: "Sky High", story: "The highest mountain we climbed." },
    { id: 4, x: 36, y: 16, label: "Sweet Gravity", date: "Falling Fast", story: "When love took over." },
    { id: 5, x: 50, y: 32, label: "Our Center", date: "Synchronized Beats", story: "The very heart of our story." },
    { id: 6, x: 64, y: 16, label: "Laughter", date: "Endless Joy", story: "Echoes of shared laughter." },
    { id: 7, x: 82, y: 28, label: "Right Peak", date: "Under The Stars", story: "Promises made in moonlight." },
    { id: 8, x: 74, y: 52, label: "Ever After", date: "Into Forever", story: "Our path leading on and on." },
  ],
  infinity: [
    { id: 1, x: 20, y: 50, label: "Left Loop", date: "Timeless", story: "Where our journey cycles." },
    { id: 2, x: 30, y: 30, label: "Upper Left", date: "Joy Rising", story: "Unbound happiness." },
    { id: 3, x: 50, y: 50, label: "The Nexus", date: "Two As One", story: "Where our souls crossed." },
    { id: 4, x: 70, y: 70, label: "Lower Right", date: "Deep Roots", story: "Grounded in trust." },
    { id: 5, x: 80, y: 50, label: "Right Loop", date: "Boundless", story: "No end in sight." },
    { id: 6, x: 70, y: 30, label: "Upper Right", date: "Starlight", story: "Shining bright." },
    { id: 7, x: 30, y: 70, label: "Lower Left", date: "Steady Anchor", story: "Holding each other safe." },
  ],
  dipper: [
    { id: 1, x: 15, y: 25, label: "Alkaid", date: "The Beginning", story: "A spark in the distance." },
    { id: 2, x: 28, y: 38, label: "Mizar", date: "The Melody", story: "Singing in the rain." },
    { id: 3, x: 40, y: 46, label: "Alioth", date: "The Bond", story: "An unbreakable connection." },
    { id: 4, x: 54, y: 50, label: "Megrez", date: "The Crossroads", story: "Choosing each other always." },
    { id: 5, x: 68, y: 64, label: "Phecda", date: "Warm Hearth", story: "Home in your embrace." },
    { id: 6, x: 84, y: 52, label: "Merak", date: "True Compass", story: "Pointing the way home." },
    { id: 7, x: 78, y: 34, label: "Dubhe", date: "North Star Beacon", story: "Guiding our tomorrow." },
  ]
};

const TABS = [
  { id: 'core', label: 'Core Identity', icon: Heart, desc: 'Names, dates & theme' },
  { id: 'capsule', label: 'Capsule & Quiz', icon: Lock, desc: 'Time capsule & trivia' },
  { id: 'photos', label: 'Visual Memories', icon: ImageIcon, desc: 'Galleries & pinboards' },
  { id: 'mapsky', label: 'Map & Sky', icon: Compass, desc: 'Places & constellations' },
  { id: 'stories', label: 'Journey & Lore', icon: BookOpen, desc: 'Timeline, reasons & letters' },
];

// Reusable Glass UI Components with Enhanced Typography & Spacing (Module Level to prevent remounting)
function Section({ title, icon, subtitle, children }) {
  return (
    <div className="p-7 sm:p-9 md:p-10 rounded-3xl bg-white/[0.025] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4),_inset_0_1px_1px_rgba(255,255,255,0.09)] relative overflow-hidden mb-10 transition-all hover:border-white/[0.13]">
      <div className="flex items-center gap-4 mb-8 pb-5 border-b border-white/[0.07]">
        {icon && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-transparent text-[#FFB3C1] border border-rose-500/30 shadow-[0_4px_16px_rgba(225,29,72,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)]">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-2xl sm:text-[26px] font-serif tracking-wide text-[#FAF6F0] font-normal">{title}</h2>
          {subtitle && <p className="text-xs sm:text-[13px] text-white/50 tracking-normal font-light mt-1 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-6 sm:space-y-7">{children}</div>
    </div>
  );
}

function InputField({ label, hint, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#EAD6C3]/90 select-none">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4.5 py-3 sm:py-3.5 bg-[#0D0A14]/70 hover:bg-[#120D1C]/80 focus:bg-[#150F21] border border-white/[0.1] hover:border-white/[0.18] focus:border-[#EAD6C3] rounded-2xl text-[14px] sm:text-[15px] text-[#FAF6F0] placeholder:text-white/25 placeholder:font-light outline-none transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.04)] focus:ring-2 focus:ring-[#EAD6C3]/25 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_0_20px_rgba(234,214,195,0.15)] ${props.className || ''}`}
      />
      {hint && <p className="text-[11.5px] text-white/45 font-normal leading-relaxed mt-1">{hint}</p>}
    </div>
  );
}

function TextAreaField({ label, hint, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#EAD6C3]/90 select-none">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-4.5 py-3.5 sm:py-4 bg-[#0D0A14]/70 hover:bg-[#120D1C]/80 focus:bg-[#150F21] border border-white/[0.1] hover:border-white/[0.18] focus:border-[#EAD6C3] rounded-2xl text-[14px] sm:text-[15px] text-[#FAF6F0] placeholder:text-white/25 placeholder:font-light outline-none transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.04)] focus:ring-2 focus:ring-[#EAD6C3]/25 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_0_20px_rgba(234,214,195,0.15)] resize-y leading-relaxed ${props.className || ''}`}
      />
      {hint && <p className="text-[11.5px] text-white/45 font-normal leading-relaxed mt-1">{hint}</p>}
    </div>
  );
}

export default function Editor() {
  const [searchParams] = useSearchParams();
  const { couple, setCouple } = useCouple();
  const [formData, setFormData] = useState(couple);
  const [saving, setSaving] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState('core');
  const fileInputRef = useRef(null);

  // Sync incoming searchParams (cloud ID or hash)
  useEffect(() => {
    const applyEditorData = (data) => {
      if (!data) return;
      setFormData(prev => ({
        ...prev,
        ...data,
        photos: Array.isArray(data.photos) && data.photos.filter(Boolean).length > 0 ? data.photos.filter(Boolean) : prev.photos,
        polaroidPhotos: Array.isArray(data.polaroidPhotos) && data.polaroidPhotos.filter(p => p && p.src).length > 0 ? data.polaroidPhotos.filter(p => p && p.src) : prev.polaroidPhotos,
        memories: Array.isArray(data.memories) && data.memories.filter(m => m && m.photo).length > 0 ? data.memories.filter(m => m && m.photo) : prev.memories,
        loveMap: Array.isArray(data.loveMap) ? data.loveMap : prev.loveMap,
        constellationStars: Array.isArray(data.constellationStars) ? data.constellationStars : prev.constellationStars,
        loveQuiz: Array.isArray(data.loveQuiz) ? data.loveQuiz : prev.loveQuiz,
        quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : prev.quizQuestions,
        loveReasons: Array.isArray(data.loveReasons) ? data.loveReasons : prev.loveReasons,
        timeline: Array.isArray(data.timeline) ? data.timeline : prev.timeline,
        openWhenCards: Array.isArray(data.openWhenCards) ? data.openWhenCards : prev.openWhenCards,
        futureDreams: Array.isArray(data.futureDreams) ? data.futureDreams : prev.futureDreams,
        randomMessages: Array.isArray(data.randomMessages) ? data.randomMessages : prev.randomMessages,
      }));
    };

    const id = searchParams.get('id');
    if (id) {
      getDoc(doc(db, 'configs', id)).then(snap => {
        if (snap.exists()) {
          applyEditorData(snap.data());
        }
      }).catch(err => console.error("Error loading config for editor:", err));
      return;
    }

    const hash = window.location.hash;
    if (hash && hash.startsWith('#data=')) {
      try {
        const parsed = JSON.parse(decodeURIComponent(hash.slice(6)));
        applyEditorData(parsed);
      } catch (e) {
        console.error("Error reading hash in editor:", e);
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...(prev[arrayName] || [])];
      if (field === null) {
        newArray[index] = value;
      } else {
        newArray[index] = { ...newArray[index], [field]: value };
      }
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleSubArrayChange = (arrayName, index, subArrayName, subIndex, value) => {
    setFormData(prev => {
      const newArray = [...(prev[arrayName] || [])];
      const item = { ...newArray[index] };
      const newSubArray = [...(item[subArrayName] || [])];
      newSubArray[subIndex] = value;
      item[subArrayName] = newSubArray;
      newArray[index] = item;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, defaultObj) => {
    setFormData(prev => {
      const current = prev[arrayName] || [];
      return { ...prev, [arrayName]: [...current, defaultObj] };
    });
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => {
      const current = prev[arrayName] || [];
      return { ...prev, [arrayName]: current.filter((_, i) => i !== index) };
    });
  };

  const handleSinglePhotoUpload = async (e, arrayName, index, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slotKey = `${arrayName}-${index}`;
    setUploadingSlot(slotKey);
    setUploadStatusMsg('Compressing image...');

    try {
      const dataUrl = await compressImageToDataUrl(file);
      handleArrayChange(arrayName, index, field, dataUrl);
      setUploadStatusMsg('');
    } catch (err) {
      console.error('Error compressing image:', err);
      alert('Failed to process image: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const exportConfigJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `love_celebration_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importConfigJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        setFormData(prev => ({ ...prev, ...imported }));
        alert("Configuration imported successfully!");
      } catch (err) {
        alert("Failed to parse JSON backup file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Fast direct Firestore save
  const saveConfig = async () => {
    if (uploadingSlot) {
      alert("Please wait for images to finish processing before saving.");
      return;
    }
    setSaving(true);
    try {
      const validPhotos = (formData.photos || []).filter(p => typeof p === 'string' && p.trim() !== '');
      const validPolaroids = (formData.polaroidPhotos || []).filter(p => p && typeof p.src === 'string' && p.src.trim() !== '');
      const validMemories = (formData.memories || []).filter(m => m && typeof m.photo === 'string' && m.photo.trim() !== '');

      const rawConfig = {
        ...formData,
        photos: validPhotos.length > 0 ? validPhotos : (couple?.photos || []),
        polaroidPhotos: validPolaroids.length > 0 ? validPolaroids : (couple?.polaroidPhotos || []),
        memories: validMemories.length > 0 ? validMemories : (couple?.memories || []),
        loveMap: formData.loveMap || (couple?.loveMap || []),
        constellationStars: formData.constellationStars || (couple?.constellationStars || []),
        loveQuiz: formData.loveQuiz || formData.quizQuestions || (couple?.loveQuiz || []),
        quizQuestions: formData.loveQuiz || formData.quizQuestions || (couple?.quizQuestions || []),
        anniversaryDateObj: null,
        timeCapsuleDate: formData.timeCapsuleDate ? new Date(formData.timeCapsuleDate) : null,
      };

      // Instantly update live app state
      setCouple(rawConfig);

      const configToSave = sanitizeForFirestore(JSON.parse(JSON.stringify(rawConfig)));
      let generatedUrl = '';

      // Direct Firestore write for instant cloud persistence
      try {
        const docRef = await addDoc(collection(db, 'configs'), configToSave);
        generatedUrl = `${window.location.origin}/?id=${docRef.id}`;
      } catch (firestoreErr) {
        console.warn('Firestore direct save encountered error, using local hash fallback:', firestoreErr);
      }

      if (!generatedUrl) {
        const encoded = encodeURIComponent(JSON.stringify(configToSave));
        generatedUrl = `${window.location.origin}/#data=${encoded}`;
      }

      setShareLink(generatedUrl);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to generate link: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#08070B] text-[#FAF6F0] font-sans relative overflow-x-hidden pb-44 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Living Aurora Ambient Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[650px] h-[650px] rounded-full bg-rose-500/[0.045] blur-[130px]" />
        <div className="absolute top-[35%] right-[10%] w-[600px] h-[600px] rounded-full bg-amber-400/[0.035] blur-[140px]" />
        <div className="absolute bottom-[10%] left-[25%] w-[750px] h-[750px] rounded-full bg-purple-600/[0.035] blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 relative z-10">
        
        {/* Luxury Top Header Bar */}
        <header className="p-7 sm:p-9 md:p-10 rounded-3xl bg-white/[0.025] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4),_inset_0_1px_1px_rgba(255,255,255,0.09)] mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-rose-500/15 border border-rose-500/30 text-[#FFB3C1]">
                Interactive Studio
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-white/40 text-xs tracking-wide">Live Anniversary Customizer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#FAF6F0] tracking-wide font-normal flex items-center gap-3">
              Site Customizer <Sparkles className="text-[#FFB3C1]" size={24} />
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1.5 max-w-xl font-light leading-relaxed">
              Curate every date, photograph, starry constellation, quiz milestone, and heartfelt note in your celebration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportConfigJson}
              title="Download backup file"
              className="px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-white/80 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <Download size={15} className="text-[#EAD6C3]" /> Export Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Load saved backup"
              className="px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-white/80 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <Upload size={15} className="text-[#EAD6C3]" /> Import Backup
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={importConfigJson}
              className="hidden"
            />
            <Link
              to="/"
              className="px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30 border border-rose-500/30 text-[#FFB3C1] text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ArrowLeft size={15} /> View Live Site
            </Link>
          </div>
        </header>

        {/* Share Link Banner (if generated) */}
        {shareLink && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-black/40 border border-rose-500/30 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-[#FFB3C1] text-sm sm:text-base font-semibold">
                <CheckCircle2 size={18} />
                <span>Your custom link is live and shareable</span>
              </div>
              <p className="text-xs sm:text-sm text-white/60 font-mono break-all select-all">
                {shareLink}
              </p>
            </div>
            <div className="flex items-center gap-3 self-stretch sm:self-auto">
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/90 text-xs sm:text-sm font-medium transition flex items-center gap-2"
              >
                <ExternalLink size={16} /> Open
              </a>
            </div>
          </motion.div>
        )}

        {/* Main Grid: Sticky Fluid Tab Nav + Editor Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-10 p-5 rounded-3xl bg-white/[0.025] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4),_inset_0_1px_1px_rgba(255,255,255,0.09)]">
            <div className="mb-4 px-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#EAD6C3]/80">Sections</span>
              <p className="text-xs text-white/45 mt-1 font-light">Select a category to customize</p>
            </div>

            {/* Mobile Horizontal Capsule Nav / Desktop Vertical List */}
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2.5 pb-2 lg:pb-0 scrollbar-none">
              {TABS.map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-xs font-medium text-left w-auto lg:w-full transition-all cursor-pointer border-none flex-shrink-0 ${
                      isActive ? 'text-[#120719]' : 'text-white/65 hover:text-white hover:bg-white/[0.035]'
                    }`}
                  >
                    {/* Animated FLIP Sliding Badge */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#EAD6C3] to-[#F3E5D8] shadow-lg"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-3.5">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-[#120719]/10 text-[#120719]' : 'bg-white/[0.04] text-[#EAD6C3]'}`}>
                        <IconComponent size={17} />
                      </div>
                      <div className="hidden lg:block">
                        <div className="font-semibold text-sm leading-tight">{tab.label}</div>
                        <div className={`text-[11px] mt-1 font-light ${isActive ? 'text-[#120719]/70' : 'text-white/40'}`}>
                          {tab.desc}
                        </div>
                      </div>
                      <span className="lg:hidden font-semibold text-xs whitespace-nowrap">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Active Tab Panel */}
          <main className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                
                {/* ──────────────── TAB 1: CORE ──────────────── */}
                {activeTab === 'core' && (
                  <>
                    <Section title="Couple Names & Identity" icon={<Heart size={22} />} subtitle="Personalize the names, initials, and hero headline across the experience">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <InputField
                          label="Partner 1 Name"
                          name="partner1"
                          value={formData.partner1 || ''}
                          onChange={handleChange}
                          placeholder="Sophia"
                        />
                        <InputField
                          label="Partner 2 Name"
                          name="partner2"
                          value={formData.partner2 || ''}
                          onChange={handleChange}
                          placeholder="Dev"
                        />
                        <InputField
                          label="Monogram / Initials"
                          name="initials"
                          value={formData.initials || ''}
                          onChange={handleChange}
                          placeholder="S ♡ D"
                        />
                      </div>

                      <div className="pt-2">
                        <TextAreaField
                          label="Hero Main Headline"
                          name="heroTitle"
                          value={formData.heroTitle || '365 Days\nof Us'}
                          onChange={handleChange}
                          rows={2}
                          hint="Tip: Use a newline to split the headline across two lines"
                        />
                      </div>
                    </Section>

                    <Section title="Dates & Milestones" icon={<Calendar size={22} />} subtitle="Configure the anniversary countdown and meeting memories">
                      <div className="p-6 sm:p-7 rounded-2xl bg-[#0D0A14]/70 border border-rose-500/25 space-y-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#FFB3C1] tracking-wider uppercase flex items-center gap-2">
                            <Sparkles size={15} /> Anniversary Date
                          </span>
                          <span className="text-xs text-white/40">Drives the live countdown clock</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="block text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#EAD6C3]/90 select-none">
                              Pick Date
                            </label>
                            <input
                              type="date"
                              value={toInputDateFormat(formData.anniversaryDate)}
                              onChange={(e) => {
                                const iso = e.target.value;
                                const formatted = toDisplayDateFormat(iso);
                                setFormData({
                                  ...formData,
                                  anniversaryDate: formatted,
                                  anniversaryDateObj: iso ? new Date(`${iso}T00:00:00`) : null,
                                });
                              }}
                              className="w-full px-4.5 py-3 sm:py-3.5 bg-[#0D0A14]/70 border border-white/[0.1] focus:border-[#EAD6C3] rounded-2xl text-[14px] sm:text-[15px] text-[#FAF6F0] outline-none transition cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                            />
                          </div>
                          <InputField
                            label="Formatted Date Text"
                            name="anniversaryDate"
                            value={formData.anniversaryDate || ''}
                            onChange={handleChange}
                            placeholder="September 15, 2026"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField
                          label="First Meeting Date / Place"
                          name="firstMeeting"
                          value={formData.firstMeeting || ''}
                          onChange={handleChange}
                          placeholder="A coffee shop on a rainy afternoon"
                        />
                        <InputField
                          label="First Official Date"
                          name="firstDate"
                          value={formData.firstDate || ''}
                          onChange={handleChange}
                          placeholder="Sunset walk at the botanical garden"
                        />
                      </div>
                    </Section>

                    <Section title="Special Song & Love Letter" icon={<Music size={22} />} subtitle="The soundtrack of your love and a personal written letter">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField
                          label="Song Title"
                          name="song"
                          value={formData.song || ''}
                          onChange={handleChange}
                          placeholder="Perfect"
                        />
                        <InputField
                          label="Artist Name"
                          name="songArtist"
                          value={formData.songArtist || ''}
                          onChange={handleChange}
                          placeholder="Ed Sheeran"
                        />
                      </div>
                      <TextAreaField
                        label="Love Letter"
                        name="loveLetterText"
                        value={formData.loveLetterText || ''}
                        onChange={handleChange}
                        rows={7}
                        hint="A heartfelt note that will be revealed in the Love Letter scroll"
                      />
                    </Section>

                    <Section title="Sweet Love Notes Generator" icon={<Sparkles size={22} />} subtitle="Quick randomized messages that appear on button clicks">
                      <div className="space-y-3.5">
                        {(formData.randomMessages || []).map((msg, rmIdx) => (
                          <div key={rmIdx} className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#0D0A14]/70 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-[#EAD6C3] focus-within:ring-2 focus-within:ring-[#EAD6C3]/20 transition-all">
                            <span className="text-xs font-mono text-[#EAD6C3]/75 font-semibold w-8 text-center">#{rmIdx + 1}</span>
                            <input
                              type="text"
                              value={msg || ''}
                              onChange={e => handleArrayChange('randomMessages', rmIdx, null, e.target.value)}
                              className="flex-1 bg-transparent px-2 py-1 text-sm sm:text-[15px] text-[#FAF6F0] outline-none placeholder:text-white/25"
                              placeholder="Write a cute short love note..."
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem('randomMessages', rmIdx)}
                              className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                              title="Delete note"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addArrayItem('randomMessages', 'A sweet new message for you...')}
                          className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer mt-3 shadow-sm active:scale-[0.99]"
                        >
                          <Plus size={17} /> Add Love Note
                        </button>
                      </div>
                    </Section>
                  </>
                )}

                {/* ──────────────── TAB 2: CAPSULE & QUIZ ──────────────── */}
                {activeTab === 'capsule' && (
                  <>
                    <Section title="Sealed Time Capsule" icon={<Lock size={22} />} subtitle="Configure the unlock timer and secret revealed message">
                      <div className="p-6 sm:p-7 rounded-2xl bg-[#0D0A14]/70 border border-purple-500/25 space-y-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-purple-300 tracking-wider uppercase flex items-center gap-2">
                            <Lock size={15} /> Unlock Date & Time
                          </span>
                          <span className="text-xs text-white/40">Counts down until sealed date</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="block text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#EAD6C3]/90 select-none">
                              Calendar Date
                            </label>
                            <input
                              type="date"
                              value={toInputDateFormat(formData.timeCapsuleDate)}
                              onChange={(e) => {
                                const iso = e.target.value;
                                const formatted = toDisplayDateFormat(iso);
                                setFormData({
                                  ...formData,
                                  timeCapsuleDate: formatted,
                                });
                              }}
                              className="w-full px-4.5 py-3 sm:py-3.5 bg-[#0D0A14]/70 border border-white/[0.1] focus:border-[#EAD6C3] rounded-2xl text-[14px] sm:text-[15px] text-[#FAF6F0] outline-none transition cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                            />
                          </div>
                          <InputField
                            label="Unlock Date Display"
                            value={typeof formData.timeCapsuleDate === 'string' ? formData.timeCapsuleDate : (formData.timeCapsuleDate ? new Date(formData.timeCapsuleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'September 15, 2026')}
                            onChange={(e) => setFormData({ ...formData, timeCapsuleDate: e.target.value })}
                            placeholder="September 15, 2026"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField
                          label="Capsule Title"
                          name="timeCapsuleTitle"
                          value={formData.timeCapsuleTitle || ''}
                          onChange={handleChange}
                          placeholder="Our Time Capsule"
                        />
                        <InputField
                          label="Capsule Subtitle"
                          name="timeCapsuleSubtitle"
                          value={formData.timeCapsuleSubtitle || ''}
                          onChange={handleChange}
                          placeholder="Sealed with Love"
                        />
                      </div>

                      <InputField
                        label="Locked Teaser Note (Visible before unlock)"
                        name="timeCapsuleTeaser"
                        value={formData.timeCapsuleTeaser || ''}
                        onChange={handleChange}
                        placeholder="Something beautiful is waiting inside..."
                      />

                      <div className="p-6 sm:p-7 rounded-2xl bg-amber-500/[0.03] border border-amber-500/25 space-y-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                        <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase flex items-center gap-2">
                          💌 Secret Unlocked Content
                        </span>
                        <InputField
                          label="Unlocked Headline"
                          name="timeCapsuleOpenedTitle"
                          value={formData.timeCapsuleOpenedTitle || ''}
                          onChange={handleChange}
                          placeholder="The Capsule Has Opened! 🥂"
                        />
                        <TextAreaField
                          label="Secret Message Body"
                          name="timeCapsuleOpenedMessage"
                          value={formData.timeCapsuleOpenedMessage || ''}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Write the deep surprise message that unlocks on your special day..."
                        />
                      </div>
                    </Section>

                    <Section title="Couple Trivia Quiz" icon={<Sparkles size={22} />} subtitle="Fun milestone questions to challenge your partner">
                      <div className="space-y-6">
                        {((formData.loveQuiz || formData.quizQuestions || [])).map((q, qIdx) => (
                          <div key={qIdx} className="p-6 sm:p-7 rounded-2xl bg-[#0F0A18]/60 hover:bg-[#120C1D]/75 border border-white/[0.08] hover:border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all space-y-5">
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-semibold tracking-wider text-[#EAD6C3]">Question #{qIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem(formData.loveQuiz ? 'loveQuiz' : 'quizQuestions', qIdx)}
                                className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <InputField
                              label="Question"
                              value={q.question || ''}
                              onChange={e => handleArrayChange(formData.loveQuiz ? 'loveQuiz' : 'quizQuestions', qIdx, 'question', e.target.value)}
                              placeholder="Where did we share our very first coffee?"
                            />

                            <div>
                              <label className="block text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#EAD6C3]/90 mb-3 select-none">
                                Multiple Choice Options & Correct Answer
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {(q.options || ['', '', '', '']).map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-3 p-3 rounded-2xl bg-[#0D0A14]/80 border border-white/[0.09] focus-within:border-[#EAD6C3] transition-all">
                                    <input
                                      type="radio"
                                      name={`correct-${qIdx}`}
                                      checked={Number(q.answer) === optIdx}
                                      onChange={() => handleArrayChange(formData.loveQuiz ? 'loveQuiz' : 'quizQuestions', qIdx, 'answer', optIdx)}
                                      className="accent-rose-500 w-4 h-4 cursor-pointer"
                                      title="Mark as correct answer"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={e => handleSubArrayChange(formData.loveQuiz ? 'loveQuiz' : 'quizQuestions', qIdx, 'options', optIdx, e.target.value)}
                                      className="flex-1 bg-transparent px-2 text-sm sm:text-[14px] text-[#FAF6F0] outline-none placeholder:text-white/25"
                                      placeholder={`Option ${optIdx + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <InputField
                              label="Fun Explanation / Celebration Note"
                              value={q.explanation || ''}
                              onChange={e => handleArrayChange(formData.loveQuiz ? 'loveQuiz' : 'quizQuestions', qIdx, 'explanation', e.target.value)}
                              placeholder="Because you ordered an iced latte on a freezing day!"
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addArrayItem(formData.loveQuiz ? 'loveQuiz' : 'quizQuestions', {
                            question: 'What is our favorite shared memory?',
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            answer: 0,
                            explanation: 'A memory we will never forget!'
                          })}
                          className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <Plus size={17} /> Add Quiz Question
                        </button>
                      </div>
                    </Section>
                  </>
                )}

                {/* ──────────────── TAB 3: PHOTOS ──────────────── */}
                {activeTab === 'photos' && (
                  <>
                    <Section title="Carousel Memories" icon={<ImageIcon size={22} />} subtitle="Slideshow photos with captions, locations, and dates">
                      <div className="space-y-6">
                        {(formData.memories || []).map((mem, memIdx) => (
                          <div key={memIdx} className="p-6 sm:p-7 rounded-2xl bg-[#0F0A18]/60 hover:bg-[#120C1D]/75 border border-white/[0.08] hover:border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-black/50 border border-white/10 relative flex-shrink-0 flex items-center justify-center group shadow-inner">
                              {mem.photo ? (
                                <img src={mem.photo} alt={mem.title} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white/35 text-xs font-light">No Photo Uploaded</span>
                              )}
                              <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer transition">
                                <ImagePlus size={22} className="mb-1 text-[#FFB3C1]" />
                                Replace Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleSinglePhotoUpload(e, 'memories', memIdx, 'photo')}
                                />
                              </label>
                            </div>

                            <div className="flex-1 space-y-4">
                              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-semibold tracking-wider text-[#EAD6C3]">Memory #{memIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('memories', memIdx)}
                                  className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField
                                  label="Title"
                                  value={mem.title || ''}
                                  onChange={e => handleArrayChange('memories', memIdx, 'title', e.target.value)}
                                  placeholder="Sunset by the Shore"
                                />
                                <InputField
                                  label="Date / Milestone"
                                  value={mem.date || ''}
                                  onChange={e => handleArrayChange('memories', memIdx, 'date', e.target.value)}
                                  placeholder="June 2025"
                                />
                              </div>

                              <TextAreaField
                                label="Memory Story"
                                value={mem.desc || ''}
                                onChange={e => handleArrayChange('memories', memIdx, 'desc', e.target.value)}
                                rows={2}
                                placeholder="The day we spent walking on the sand..."
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addArrayItem('memories', {
                            title: 'New Memory',
                            date: 'Summer 2026',
                            desc: 'A beautiful moment together.',
                            photo: ''
                          })}
                          className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <Plus size={17} /> Add Carousel Memory
                        </button>
                      </div>
                    </Section>

                    <Section title="Polaroid Pinboard" icon={<Sparkles size={22} />} subtitle="Tactile polaroid snapshots with handwritten captions">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {(formData.polaroidPhotos || []).map((pol, polIdx) => (
                          <div key={polIdx} className="p-5 sm:p-6 rounded-2xl bg-[#0F0A18]/60 hover:bg-[#120C1D]/75 border border-white/[0.08] hover:border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all space-y-4">
                            <div className="h-52 rounded-2xl overflow-hidden bg-black/50 border border-white/10 relative flex items-center justify-center group shadow-inner">
                              {pol.src ? (
                                <img src={pol.src} alt={pol.caption} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white/35 text-xs font-light">No Polaroid Image</span>
                              )}
                              <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer transition">
                                <ImagePlus size={22} className="mb-1 text-[#FFB3C1]" />
                                Upload Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleSinglePhotoUpload(e, 'polaroidPhotos', polIdx, 'src')}
                                />
                              </label>
                            </div>

                            <InputField
                              label="Caption"
                              value={pol.caption || ''}
                              onChange={e => handleArrayChange('polaroidPhotos', polIdx, 'caption', e.target.value)}
                              placeholder="Laughing under the umbrella"
                            />

                            <div className="flex items-center justify-between pt-1">
                              <InputField
                                label="Date"
                                value={pol.date || ''}
                                onChange={e => handleArrayChange('polaroidPhotos', polIdx, 'date', e.target.value)}
                                placeholder="Oct 12"
                                className="w-36"
                              />
                              <button
                                type="button"
                                onClick={() => removeArrayItem('polaroidPhotos', polIdx)}
                                className="p-2.5 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer self-end active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addArrayItem('polaroidPhotos', {
                          src: '',
                          caption: 'Sweet memory',
                          date: 'A special day',
                          rotate: Math.floor(Math.random() * 8) - 4
                        })}
                        className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer mt-5 shadow-sm active:scale-[0.99]"
                      >
                        <Plus size={17} /> Add Polaroid Card
                      </button>
                    </Section>

                    <Section title="Photo Gallery Collection" icon={<ImageIcon size={22} />} subtitle="General gallery photos showcased in the romantic grid">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(formData.photos || []).map((photoUrl, pIdx) => (
                          <div key={pIdx} className="aspect-square rounded-2xl bg-black/50 border border-white/10 relative overflow-hidden group shadow-inner">
                            {photoUrl ? (
                              <img src={photoUrl} alt={`Gallery ${pIdx + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">Empty Slot</div>
                            )}
                            <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                              <label className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white cursor-pointer transition active:scale-95">
                                <ImagePlus size={18} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleSinglePhotoUpload(e, 'photos', pIdx, null)}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => removeArrayItem('photos', pIdx)}
                                className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition cursor-pointer active:scale-95"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <label className="aspect-square rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] flex flex-col items-center justify-center text-[#EAD6C3] hover:bg-white/[0.03] cursor-pointer transition p-4 text-center group active:scale-95">
                          <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium tracking-wide">Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingSlot('gallery-new');
                              try {
                                const dataUrl = await compressImageToDataUrl(file);
                                addArrayItem('photos', dataUrl);
                              } catch (err) {
                                alert("Upload failed: " + err.message);
                              } finally {
                                setUploadingSlot(null);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      </div>
                    </Section>
                  </>
                )}

                {/* ──────────────── TAB 4: MAP & SKY ──────────────── */}
                {activeTab === 'mapsky' && (
                  <>
                    <Section title="Interactive Love Map" icon={<MapPin size={22} />} subtitle="Pin the special cities, trips, and memories on your world map">
                      <div className="space-y-6">
                        {(formData.loveMap || []).map((loc, lIdx) => (
                          <div key={lIdx} className="p-6 sm:p-7 rounded-2xl bg-[#0F0A18]/60 hover:bg-[#120C1D]/75 border border-white/[0.08] hover:border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all space-y-5">
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-semibold tracking-wider text-[#EAD6C3]">Location #{lIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem('loveMap', lIdx)}
                                className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <InputField
                                label="City / Location Name"
                                value={loc.city || ''}
                                onChange={e => handleArrayChange('loveMap', lIdx, 'city', e.target.value)}
                                placeholder="Paris, France"
                              />
                              <InputField
                                label="Latitude"
                                type="number"
                                step="any"
                                value={loc.lat || ''}
                                onChange={e => handleArrayChange('loveMap', lIdx, 'lat', parseFloat(e.target.value) || 0)}
                                placeholder="48.8566"
                              />
                              <InputField
                                label="Longitude"
                                type="number"
                                step="any"
                                value={loc.lng || ''}
                                onChange={e => handleArrayChange('loveMap', lIdx, 'lng', parseFloat(e.target.value) || 0)}
                                placeholder="2.3522"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <InputField
                                label="Date / Trip Milestone"
                                value={loc.date || ''}
                                onChange={e => handleArrayChange('loveMap', lIdx, 'date', e.target.value)}
                                placeholder="August 2025"
                              />
                              <div className="space-y-2">
                                <label className="block text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#EAD6C3]/90 select-none">
                                  Preset City Auto-Fill
                                </label>
                                <select
                                  onChange={e => {
                                    const c = POPULAR_CITIES.find(p => p.name === e.target.value);
                                    if (c) {
                                      handleArrayChange('loveMap', lIdx, 'city', c.name);
                                      handleArrayChange('loveMap', lIdx, 'lat', c.lat);
                                      handleArrayChange('loveMap', lIdx, 'lng', c.lng);
                                    }
                                  }}
                                  className="w-full px-4.5 py-3 sm:py-3.5 bg-[#0D0A14]/70 border border-white/[0.1] focus:border-[#EAD6C3] rounded-2xl text-[14px] sm:text-[15px] text-[#FAF6F0] outline-none cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                                >
                                  <option value="">-- Pick from popular romantic destinations --</option>
                                  {POPULAR_CITIES.map((c, i) => (
                                    <option key={i} value={c.name}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <TextAreaField
                              label="Memory / Story at this Place"
                              value={loc.desc || ''}
                              onChange={e => handleArrayChange('loveMap', lIdx, 'desc', e.target.value)}
                              rows={2}
                              placeholder="Where we watched the sunset over the river..."
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addArrayItem('loveMap', {
                            city: 'Rome, Italy',
                            lat: 41.9028,
                            lng: 12.4964,
                            desc: 'Gelato by the Spanish Steps.',
                            date: 'Spring 2026'
                          })}
                          className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <Plus size={17} /> Add Map Location
                        </button>
                      </div>
                    </Section>

                    <Section title="Night Sky Constellation" icon={<Star size={22} />} subtitle="Configure the stars that form your romantic cosmic constellation">
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D0A14]/70 border border-white/[0.08]">
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-[#EAD6C3] tracking-wide">Load Cosmic Shape Preset</span>
                            <p className="text-xs text-white/45 mt-0.5 font-light">Choose a pre-configured geometry for your stars</p>
                          </div>
                          <div className="flex gap-2.5">
                            {Object.keys(CONSTELLATION_PRESETS).map((pKey) => (
                              <button
                                key={pKey}
                                type="button"
                                onClick={() => setFormData({ ...formData, constellationStars: CONSTELLATION_PRESETS[pKey] })}
                                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium capitalize text-white/85 transition cursor-pointer active:scale-95"
                              >
                                {pKey}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(formData.constellationStars || []).map((star, sIdx) => (
                          <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-[#0F0A18]/60 hover:bg-[#120C1D]/75 border border-white/[0.08] hover:border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-semibold tracking-wider text-[#EAD6C3] flex items-center gap-1.5">
                                <Star size={13} className="text-amber-300" /> Star #{sIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem('constellationStars', sIdx)}
                                className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <InputField
                                label="Star Name"
                                value={star.label || ''}
                                onChange={e => handleArrayChange('constellationStars', sIdx, 'label', e.target.value)}
                                placeholder="The Spark"
                                className="sm:col-span-2"
                              />
                              <InputField
                                label="X Coordinate (0-100)"
                                type="number"
                                min="0"
                                max="100"
                                value={star.x ?? 50}
                                onChange={e => handleArrayChange('constellationStars', sIdx, 'x', parseInt(e.target.value) || 0)}
                              />
                              <InputField
                                label="Y Coordinate (0-100)"
                                type="number"
                                min="0"
                                max="100"
                                value={star.y ?? 50}
                                onChange={e => handleArrayChange('constellationStars', sIdx, 'y', parseInt(e.target.value) || 0)}
                              />
                            </div>

                            <InputField
                              label="Star Story / Milestone"
                              value={star.story || ''}
                              onChange={e => handleArrayChange('constellationStars', sIdx, 'story', e.target.value)}
                              placeholder="When we looked up at the stars together..."
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addArrayItem('constellationStars', {
                            id: Date.now(),
                            x: 50,
                            y: 50,
                            label: 'New Star',
                            date: 'A Golden Moment',
                            story: 'A memory etched in the night sky.'
                          })}
                          className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <Plus size={17} /> Add Constellation Star
                        </button>
                      </div>
                    </Section>
                  </>
                )}

                {/* ──────────────── TAB 5: STORIES ──────────────── */}
                {activeTab === 'stories' && (
                  <>
                    <Section title="Relationship Milestone Timeline" icon={<BookOpen size={22} />} subtitle="Chronicle the journey of how your love evolved">
                      <div className="space-y-6">
                        {(formData.timeline || []).map((tl, tlIdx) => (
                          <div key={tlIdx} className="p-6 sm:p-7 rounded-2xl bg-[#0F0A18]/60 hover:bg-[#120C1D]/75 border border-white/[0.08] hover:border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-semibold tracking-wider text-[#EAD6C3]">Milestone #{tlIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem('timeline', tlIdx)}
                                className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <InputField
                                label="Date / Period"
                                value={tl.date || ''}
                                onChange={e => handleArrayChange('timeline', tlIdx, 'date', e.target.value)}
                                placeholder="September 2024"
                              />
                              <InputField
                                label="Milestone Title"
                                value={tl.title || ''}
                                onChange={e => handleArrayChange('timeline', tlIdx, 'title', e.target.value)}
                                placeholder="The Day We Met"
                              />
                            </div>

                            <TextAreaField
                              label="Description"
                              value={tl.desc || ''}
                              onChange={e => handleArrayChange('timeline', tlIdx, 'desc', e.target.value)}
                              rows={2}
                              placeholder="Write about what made this milestone unforgettable..."
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addArrayItem('timeline', {
                            date: 'New Chapter',
                            title: 'Our Next Milestone',
                            desc: 'Continuing our journey together hand in hand.'
                          })}
                          className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <Plus size={17} /> Add Timeline Milestone
                        </button>
                      </div>
                    </Section>

                    <Section title="100 Reasons Why I Love You" icon={<Heart size={22} />} subtitle="The sweet, funny, and profound reasons you adore them">
                      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2.5 scrollbar-thin">
                        {(formData.loveReasons || []).map((reason, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#0D0A14]/70 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-[#EAD6C3] focus-within:ring-2 focus-within:ring-[#EAD6C3]/20 transition-all">
                            <span className="text-xs font-mono text-[#EAD6C3]/75 font-semibold w-9 text-center">#{rIdx + 1}</span>
                            <input
                              type="text"
                              value={reason || ''}
                              onChange={e => handleArrayChange('loveReasons', rIdx, null, e.target.value)}
                              className="flex-1 bg-transparent px-2 py-1 text-sm sm:text-[15px] text-[#FAF6F0] outline-none placeholder:text-white/25"
                              placeholder="Because your smile lights up my whole day..."
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem('loveReasons', rIdx)}
                              className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addArrayItem('loveReasons', 'Another reason why I love you so much...')}
                        className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer mt-5 shadow-sm active:scale-[0.99]"
                      >
                        <Plus size={17} /> Add Reason
                      </button>
                    </Section>

                    <Section title="Future Dreams & Bucket List" icon={<Sparkles size={22} />} subtitle="Adventures and milestones you look forward to conquering together">
                      <div className="space-y-5">
                        {(formData.futureDreams || []).map((dream, dIdx) => (
                          <div key={dIdx} className="p-5 sm:p-6 rounded-2xl bg-[#0F0A18]/60 hover:bg-[#120C1D]/75 border border-white/[0.08] hover:border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-semibold tracking-wider text-[#EAD6C3]">Dream #{dIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem('futureDreams', dIdx)}
                                className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <InputField
                              label="Dream Title"
                              value={dream.title || ''}
                              onChange={e => handleArrayChange('futureDreams', dIdx, 'title', e.target.value)}
                              placeholder="See the Northern Lights in Norway"
                            />

                            <TextAreaField
                              label="Description"
                              value={dream.desc || ''}
                              onChange={e => handleArrayChange('futureDreams', dIdx, 'desc', e.target.value)}
                              rows={2}
                              placeholder="Wrapped in a blanket sharing hot chocolate under green skies..."
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addArrayItem('futureDreams', {
                            title: 'New Adventure',
                            desc: 'Something wonderful we will do together.'
                          })}
                          className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <Plus size={17} /> Add Future Dream
                        </button>
                      </div>
                    </Section>

                    <Section title="Open When... Letters" icon={<BookOpen size={22} />} subtitle="Envelopes to open when your partner needs a smile">
                      <div className="space-y-6">
                        {(formData.openWhenCards || []).map((card, cIdx) => (
                          <div key={cIdx} className="p-6 sm:p-7 rounded-2xl bg-[#0F0A18]/60 hover:bg-[#120C1D]/75 border border-white/[0.08] hover:border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-semibold tracking-wider text-[#EAD6C3]">Envelope #{cIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem('openWhenCards', cIdx)}
                                className="p-2 rounded-xl text-white/40 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <InputField
                              label="Open When... Prompt"
                              value={card.title || ''}
                              onChange={e => handleArrayChange('openWhenCards', cIdx, 'title', e.target.value)}
                              placeholder="Open when you are having a tough day"
                            />

                            <TextAreaField
                              label="Letter Content"
                              value={card.message || ''}
                              onChange={e => handleArrayChange('openWhenCards', cIdx, 'message', e.target.value)}
                              rows={3}
                              placeholder="Remember that you are capable of anything and I am always in your corner..."
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addArrayItem('openWhenCards', {
                            title: 'Open when you need a hug',
                            message: 'Close your eyes and feel my arms around you.'
                          })}
                          className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-[#EAD6C3] bg-white/[0.015] hover:bg-[#EAD6C3]/[0.06] text-[#EAD6C3] hover:text-[#FFF] text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <Plus size={17} /> Add Envelope Letter
                        </button>
                      </div>
                    </Section>
                  </>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Floating Island Action Dock (Bottom Center) */}
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="pointer-events-auto p-4 rounded-full bg-[#120719]/90 backdrop-blur-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 px-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            <span className="text-xs sm:text-sm text-white/75 font-medium hidden sm:inline tracking-wide">
              {uploadingSlot ? uploadStatusMsg || 'Uploading...' : 'Ready to publish'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveConfig}
              disabled={saving || !!uploadingSlot}
              className="px-7 py-3 rounded-full bg-gradient-to-r from-[#FF9AA2] via-[#FF758F] to-[#E11D48] hover:from-[#FFA6AD] hover:to-[#EB244F] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-[0_4px_20px_rgba(225,29,72,0.45)] flex items-center gap-2.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin text-white" /> : <Save size={16} />}
              <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Luxury Celebration Modal Popup */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="bg-[#120719]/90 border border-white/12 rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-[0_30px_70px_rgba(0,0,0,0.85),_inset_0_1px_1px_rgba(255,255,255,0.18)] text-center relative overflow-hidden backdrop-blur-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500/20 to-pink-400/20 text-[#FFB3C1] border border-rose-500/30 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Sparkles size={32} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#FAF6F0] font-normal mb-2 tracking-wide">
                Your Celebration is Live!
              </h2>
              <p className="text-xs sm:text-sm text-white/55 mb-7 max-w-sm mx-auto leading-relaxed font-light">
                All your special dates, timeline memories, and romantic constellation stars have been safely published to the cloud.
              </p>

              <div className="p-4 rounded-2xl bg-[#0D0A14]/90 border border-white/[0.1] font-mono text-xs text-white/85 break-all select-all mb-7 shadow-inner">
                {shareLink}
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5">
                <button
                  onClick={() => copyToClipboard(shareLink)}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition active:scale-95 cursor-pointer"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Shareable Link'}</span>
                </button>
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3.5 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink size={17} />
                  <span>Open Site</span>
                </a>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 text-xs text-white/45 hover:text-white/80 transition cursor-pointer"
              >
                Close and continue editing
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
