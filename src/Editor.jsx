import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCouple } from './CoupleContext';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import {
  Save, ImagePlus, Loader2, Plus, Trash2, Check, Copy, ExternalLink,
  Sparkles, Download, Upload, Calendar, MapPin, Star, Compass, Heart
} from 'lucide-react';
import { compressImageToDataUrl } from './utils/imageCompressor';

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

// Convert "September 15, 2026" or Date to "YYYY-MM-DD" for HTML date inputs
function toInputDateFormat(dateVal) {
  if (!dateVal) return '';
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert "YYYY-MM-DD" to human readable "September 15, 2026"
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
  { name: "-- Select Quick City Preset --", coords: null },
  { name: "Rishra, West Bengal", coords: [22.7233, 88.3494], emoji: "🌸" },
  { name: "Kolkata, India", coords: [22.5726, 88.3639], emoji: "💖" },
  { name: "Delhi / NCR, India", coords: [28.6139, 77.2090], emoji: "🏛️" },
  { name: "Mumbai, India", coords: [19.0760, 72.8777], emoji: "🌊" },
  { name: "Bengaluru, India", coords: [12.9716, 77.5946], emoji: "☕" },
  { name: "Goa, India", coords: [15.2993, 74.1240], emoji: "🏖️" },
  { name: "Manali / Himalayas", coords: [32.2432, 77.1892], emoji: "🏔️" },
  { name: "Jaipur, India", coords: [26.9124, 75.7873], emoji: "🏰" },
  { name: "Paris, France", coords: [48.8566, 2.3522], emoji: "🗼" },
  { name: "Rome, Italy", coords: [41.9028, 12.4964], emoji: "🍕" },
  { name: "Amalfi Coast, Italy", coords: [40.6340, 14.6027], emoji: "🌊" },
  { name: "London, UK", coords: [51.5074, -0.1278], emoji: "🎡" },
  { name: "New York City, USA", coords: [40.7128, -74.0060], emoji: "🗽" },
  { name: "Tokyo, Japan", coords: [35.6762, 139.6503], emoji: "🌸" },
  { name: "Bali, Indonesia", coords: [-8.4095, 115.1889], emoji: "🌴" },
  { name: "Dubai, UAE", coords: [25.2048, 55.2708], emoji: "✨" },
  { name: "Santorini, Greece", coords: [36.3932, 25.4615], emoji: "🌅" },
];

const CONSTELLATION_PRESETS = {
  heart: [
    { id: 1, x: 50, y: 80, label: "Our Foundation", date: "Where it started", story: "The bottom point that holds our love forever." },
    { id: 2, x: 25, y: 55, label: "First Date", date: "Sweet beginning", story: "The day magic happened." },
    { id: 3, x: 28, y: 28, label: "First 'I Love You'", date: "Words of love", story: "When you spoke the words my heart knew." },
    { id: 4, x: 50, y: 40, label: "Heart Center", date: "Deep connection", story: "The heartbeat uniting our souls." },
    { id: 5, x: 72, y: 28, label: "Favorite Trip", date: "Unforgettable", story: "Under the stars together." },
    { id: 6, x: 75, y: 55, label: "Special Milestone", date: "Growing together", story: "Every step side by side." },
    { id: 7, x: 50, y: 80, label: "Forever Us", date: "Endless love", story: "Closing our constellation in eternity." },
  ],
  cosmos: [
    { id: 1, x: 15, y: 20, label: "First Hello", date: "Aug 9, 2025", story: "The first message that changed everything." },
    { id: 2, x: 30, y: 55, label: "First Date", date: "Sep 21, 2025", story: "A sunset walk that lasted until midnight." },
    { id: 3, x: 50, y: 30, label: "First 'I Love You'", date: "Nov 1, 2025", story: "Words that rearranged my entire universe." },
    { id: 4, x: 65, y: 65, label: "First Christmas", date: "Dec 25, 2025", story: "The quietest, warmest holiday of my life." },
    { id: 5, x: 80, y: 25, label: "First Trip", date: "Apr 3, 2026", story: "Getting lost in Amalfi and finding everything." },
    { id: 6, x: 45, y: 75, label: "First Anniversary", date: "Aug 9, 2026", story: "365 days. A galaxy of moments." },
    { id: 7, x: 20, y: 80, label: "Inside Joke", date: "Ongoing", story: "You know which one. 🦆" },
    { id: 8, x: 85, y: 75, label: "Our Song", date: "Sep 30, 2025", story: "'Perfect' came on and we slow-danced in the kitchen." },
  ],
  infinity: [
    { id: 1, x: 50, y: 50, label: "Crossroads", date: "Our Meeting", story: "Where our paths crossed." },
    { id: 2, x: 28, y: 28, label: "Left Peak", date: "High Spirits", story: "Our laughter that reached the stars." },
    { id: 3, x: 15, y: 50, label: "Left Loop", date: "Endless Care", story: "Looping through sweet moments." },
    { id: 4, x: 28, y: 72, label: "Left Low", date: "Deep Bonds", story: "Holding each other through every storm." },
    { id: 5, x: 50, y: 50, label: "Center Us", date: "Core Love", story: "Coming together as one." },
    { id: 6, x: 72, y: 28, label: "Right Peak", date: "Future Dreams", story: "Reaching for every tomorrow." },
    { id: 7, x: 85, y: 50, label: "Right Loop", date: "Infinite Love", story: "Forever stretching into eternity." },
    { id: 8, x: 72, y: 72, label: "Right Low", date: "Everlasting Promise", story: "Never letting go." },
  ]
};

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
  const [activeStarPreview, setActiveStarPreview] = useState(null);
  const linkRef = useRef(null);
  const fileInputRef = useRef(null);

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
      }));
    };

    // 1. Load from Cloud Blob (?blob=...)
    const blobId = searchParams.get('blob');
    if (blobId) {
      fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`)
        .then(r => r.json())
        .then(data => applyEditorData(data))
        .catch(err => console.error("Error loading config from blob in editor:", err));
      return;
    }

    // 2. Load from Firestore (?id=...)
    const id = searchParams.get('id');
    if (id) {
      getDoc(doc(db, 'configs', id)).then(snap => {
        if (snap.exists()) {
          applyEditorData(snap.data());
        }
      }).catch(err => console.error("Error loading config for editor:", err));
      return;
    }

    // 3. Load from URL hash (#data=...) if present
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...(formData[arrayName] || [])];
    if (field === null) {
      newArray[index] = value;
    } else {
      newArray[index] = { ...newArray[index], [field]: value };
    }
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const handleRemoveItem = (arrayName, index) => {
    const newArray = (formData[arrayName] || []).filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: newArray });
  };

  // Constellation helpers
  const addNewConstellationStar = () => {
    const current = formData.constellationStars || [];
    const newStar = {
      id: Date.now(),
      x: Math.floor(Math.random() * 60 + 20),
      y: Math.floor(Math.random() * 60 + 20),
      label: `Star #${current.length + 1}`,
      date: 'Special Moment',
      story: 'A new bright star shining in our love story ✨',
    };
    setFormData({ ...formData, constellationStars: [...current, newStar] });
  };

  const applyConstellationPreset = (presetKey) => {
    const preset = CONSTELLATION_PRESETS[presetKey];
    if (preset) {
      setFormData({ ...formData, constellationStars: JSON.parse(JSON.stringify(preset)) });
    }
  };

  // Love Map helpers
  const addNewLoveMapLocation = () => {
    const current = formData.loveMap || [];
    const newLoc = {
      name: 'New Special Place',
      coords: [28.6139, 77.2090],
      date: 'Memorable Day',
      story: 'A place where we shared beautiful memories together.',
      emoji: '💖',
    };
    setFormData({ ...formData, loveMap: [...current, newLoc] });
  };

  const setMapPreset = (index, cityObj) => {
    if (!cityObj || !cityObj.coords) return;
    const newArray = [...(formData.loveMap || [])];
    newArray[index] = {
      ...newArray[index],
      name: cityObj.name,
      coords: cityObj.coords,
      emoji: cityObj.emoji || newArray[index].emoji || '💖',
    };
    setFormData({ ...formData, loveMap: newArray });
  };

  const addNewMemory = () => {
    const newMem = {
      id: Date.now(),
      photo: '',
      date: 'New Date',
      location: 'New Location',
      caption: 'A wonderful memory together.'
    };
    setFormData({ ...formData, memories: [...(formData.memories || []), newMem] });
  };

  const addNewPolaroid = () => {
    const newPol = {
      src: '',
      caption: 'sweet moment 💕',
      rotation: Math.floor(Math.random() * 12 - 6),
    };
    setFormData({ ...formData, polaroidPhotos: [...(formData.polaroidPhotos || []), newPol] });
  };

  const addNewVaultPhoto = () => {
    setFormData({ ...formData, photos: [...(formData.photos || []), ''] });
  };

  // Instant Local Base64 Image Compression
  const handleSinglePhotoUpload = async (e, arrayName, index, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slotKey = `${arrayName}-${index}`;
    setUploadingSlot(slotKey);
    setUploadStatusMsg('Compressing...');

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
        anniversaryDateObj: null,
        timeCapsuleDate: formData.timeCapsuleDate ? new Date(formData.timeCapsuleDate) : null,
      };

      // 1. Instantly update live site & localStorage
      setCouple(rawConfig);

      const configToSave = sanitizeForFirestore(JSON.parse(JSON.stringify(rawConfig)));

      // 2. Generate reliable cloud share link (jsonblob + Firestore)
      let generatedUrl = '';

      try {
        const res = await fetch('https://jsonblob.com/api/jsonBlob', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(configToSave),
        });
        const loc = res.headers.get('Location') || res.headers.get('location');
        if (loc) {
          const blobId = loc.split('/').pop();
          generatedUrl = `${window.location.origin}/?blob=${blobId}`;
        }
      } catch (blobErr) {
        console.warn('Cloud blob save failed, trying Firestore:', blobErr);
      }

      if (!generatedUrl) {
        try {
          const docRef = await addDoc(collection(db, 'configs'), configToSave);
          generatedUrl = `${window.location.origin}/?id=${docRef.id}`;
        } catch (firestoreErr) {
          console.warn('Firestore save failed:', firestoreErr);
        }
      }

      if (!generatedUrl) {
        const encoded = encodeURIComponent(JSON.stringify(configToSave));
        generatedUrl = `${window.location.origin}/#data=${encoded}`;
      }

      setShareLink(generatedUrl);
      setShowSuccessModal(true);

      // Scroll to link
      setTimeout(() => {
        linkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to generate link: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title, icon, subtitle, children }) => (
    <div className="mb-12 bg-white p-6 md:p-8 rounded-3xl border border-rose-100/60 shadow-sm">
      <div className="flex items-center gap-3 mb-2 pb-2 border-b border-rose-100">
        {icon && <div className="p-2 rounded-xl bg-rose-50 text-[#D4838A]">{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display' }}>{title}</h2>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="pt-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32" style={{ background: '#FDFBF7', color: '#3D3D3D' }}>
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b bg-white p-6 md:p-8 rounded-3xl shadow-md border border-rose-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}>
              Site Customizer ✨
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Personalize every date, map location, constellation star, memory, and message.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportConfigJson}
              title="Download backup file of your customized site"
              className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download size={14} /> Export Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Load a previously saved backup file"
              className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Upload size={14} /> Import Backup
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
              className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition"
            >
              ← View Live Site
            </Link>
          </div>
        </div>

        {/* Top Link Banner if generated */}
        {shareLink && (
          <div ref={linkRef} className="mb-8 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-3xl border-2 border-pink-200 shadow-md">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-lg mb-2">
              <Sparkles className="text-pink-500" size={20} />
              <span>Your Custom Shareable Link is Ready!</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Share this permanent link with your partner. All your photos, dates, map, and constellation are live!
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 p-3 bg-white border border-pink-300 rounded-xl text-sm font-mono text-gray-800 select-all shadow-inner"
              />
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ExternalLink size={18} />
                Open Site
              </a>
            </div>
          </div>
        )}

        <div className="space-y-8">
          
          {/* 1. Basic Names & Initials */}
          <Section title="Couple Names & Initials" icon={<Heart size={20} />} subtitle="Personalize the names across the entire site">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Partner 1</label>
                <input type="text" name="partner1" value={formData.partner1 || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium" placeholder="Dristi" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Partner 2</label>
                <input type="text" name="partner2" value={formData.partner2 || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium" placeholder="Vedant" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Initials Animation</label>
                <input type="text" name="initials" value={formData.initials || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium" placeholder="D ♡ V" />
              </div>
            </div>
          </Section>

          {/* 2. Custom Date & Countdown Timers */}
          <Section title="Important Dates & Milestones" icon={<Calendar size={20} />} subtitle="Set your Anniversary date and relationship milestones">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Anniversary Date */}
              <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-rose-900">🎉 Anniversary Date</span>
                  <span className="text-xs text-rose-600 font-medium">Controls the live countdown timer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">📅 Pick from Calendar:</label>
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
                      className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-sm font-bold text-gray-800 shadow-sm cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">✍️ Or Edit Formatted Date Text:</label>
                    <input
                      type="text"
                      name="anniversaryDate"
                      value={formData.anniversaryDate || ''}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-sm font-medium text-gray-800"
                      placeholder="e.g. September 15, 2026"
                    />
                  </div>
                </div>
              </div>

              {/* First Meeting & First Date */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Meeting Place & Date</label>
                <input
                  type="text"
                  name="firstMeeting"
                  value={formData.firstMeeting || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-sm"
                  placeholder="e.g. A coffee shop on a rainy afternoon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Date Memory</label>
                <input
                  type="text"
                  name="firstDate"
                  value={formData.firstDate || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-sm"
                  placeholder="e.g. A sunset walk at the botanical garden"
                />
              </div>

            </div>
          </Section>

          {/* 3. Time Capsule Customizer */}
          <Section title="Our Secret Time Capsule" icon={<Sparkles size={20} />} subtitle="Customize the sealed capsule lock date, teaser, and the secret message inside">
            <div className="space-y-5">
              
              {/* Unlock Date */}
              <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-900">🔒 Capsule Unlock Date & Time</span>
                  <span className="text-xs text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">Sealed Countdown</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">📅 Select Unlock Date:</label>
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
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-sm font-bold text-gray-800 shadow-sm cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">✍️ Or Edit Unlock Date Text:</label>
                    <input
                      type="text"
                      value={typeof formData.timeCapsuleDate === 'string' ? formData.timeCapsuleDate : (formData.timeCapsuleDate ? new Date(formData.timeCapsuleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'September 15, 2026')}
                      onChange={(e) => setFormData({ ...formData, timeCapsuleDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-sm font-medium text-gray-800"
                      placeholder="e.g. September 15, 2026"
                    />
                  </div>
                </div>
              </div>

              {/* Headings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Capsule Title</label>
                  <input
                    type="text"
                    name="timeCapsuleTitle"
                    value={formData.timeCapsuleTitle || 'Our Time Capsule'}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm font-bold"
                    placeholder="Our Time Capsule"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Capsule Subtitle / Tagline</label>
                  <input
                    type="text"
                    name="timeCapsuleSubtitle"
                    value={formData.timeCapsuleSubtitle || 'Sealed with Love'}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm"
                    placeholder="Sealed with Love"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Locked Teaser Note (While Countdown is Running)</label>
                <input
                  type="text"
                  name="timeCapsuleTeaser"
                  value={formData.timeCapsuleTeaser || 'Something beautiful is waiting inside...'}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm text-gray-700"
                  placeholder="Something beautiful is waiting inside..."
                />
              </div>

              {/* Opened Secret Note */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <span>💌 Secret Message Sealed Inside the Capsule</span>
                </div>
                <p className="text-xs text-gray-500">
                  This message will automatically reveal and celebrate once the unlock countdown reaches zero!
                </p>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Unlocked Headline</label>
                  <input
                    type="text"
                    name="timeCapsuleOpenedTitle"
                    value={formData.timeCapsuleOpenedTitle || 'The Capsule Has Opened! 🥂'}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl text-sm font-bold"
                    placeholder="The Capsule Has Opened! 🥂"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Secret Letter Content</label>
                  <textarea
                    name="timeCapsuleMessage"
                    value={formData.timeCapsuleMessage || "Two years ago, we sealed this moment in time — a promise to keep growing, keep choosing, and keep loving. If you're reading this, we did it. Here's to us. 🥂"}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-amber-300 rounded-xl text-sm h-28 font-serif leading-relaxed"
                    placeholder="Write a secret message to open on your anniversary..."
                  />
                </div>
              </div>

            </div>
          </Section>

          {/* 3. Our Love Map Customizer */}
          <Section title="Our Love Map (Interactive Map)" icon={<MapPin size={20} />} subtitle="Add all the cities, vacation spots, and meaningful places where your love lived">
            <div className="space-y-5">
              {(formData.loveMap || []).map((loc, i) => (
                <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{loc.emoji || '💖'}</span>
                      <h4 className="font-bold text-gray-800">Location #{i + 1}: {loc.name || 'Unnamed Place'}</h4>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('loveMap', i)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border shadow-sm"
                    >
                      <Trash2 size={14} /> Remove Place
                    </button>
                  </div>

                  {/* Quick City Presets Dropdown */}
                  <div className="p-3 bg-white border rounded-xl">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">🚀 Quick City Auto-Fill:</label>
                    <select
                      onChange={(e) => {
                        const selected = POPULAR_CITIES.find(c => c.name === e.target.value);
                        if (selected && selected.coords) {
                          setMapPreset(i, selected);
                        }
                      }}
                      className="w-full p-2 text-xs border rounded-lg bg-gray-50 font-medium text-gray-700 cursor-pointer"
                    >
                      {POPULAR_CITIES.map((c, cIdx) => (
                        <option key={cIdx} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Place Name</label>
                      <input
                        type="text"
                        value={loc.name || ''}
                        onChange={e => handleArrayChange('loveMap', i, 'name', e.target.value)}
                        className="w-full p-2 bg-white border rounded-lg text-sm font-medium"
                        placeholder="e.g. Rishra, Kolkata, Paris"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Emoji Icon</label>
                      <input
                        type="text"
                        value={loc.emoji || '💖'}
                        onChange={e => handleArrayChange('loveMap', i, 'emoji', e.target.value)}
                        className="w-full p-2 bg-white border rounded-lg text-sm"
                        placeholder="e.g. 🌸, 💖, ☕, 🌅, ✈️, 💍"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Date / Tag</label>
                      <input
                        type="text"
                        value={loc.date || ''}
                        onChange={e => handleArrayChange('loveMap', i, 'date', e.target.value)}
                        className="w-full p-2 bg-white border rounded-lg text-sm"
                        placeholder="e.g. Our Beginning / Sep 21, 2025"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Latitude (e.g. 22.7233)</label>
                      <input
                        type="number"
                        step="any"
                        value={loc.coords?.[0] ?? ''}
                        onChange={e => {
                          const newCoords = [Number(e.target.value), loc.coords?.[1] ?? 0];
                          handleArrayChange('loveMap', i, 'coords', newCoords);
                        }}
                        className="w-full p-2 bg-white border rounded-lg text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Longitude (e.g. 88.3494)</label>
                      <input
                        type="number"
                        step="any"
                        value={loc.coords?.[1] ?? ''}
                        onChange={e => {
                          const newCoords = [loc.coords?.[0] ?? 0, Number(e.target.value)];
                          handleArrayChange('loveMap', i, 'coords', newCoords);
                        }}
                        className="w-full p-2 bg-white border rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Story &amp; Memory</label>
                    <textarea
                      value={loc.story || ''}
                      onChange={e => handleArrayChange('loveMap', i, 'story', e.target.value)}
                      className="w-full p-2 bg-white border rounded-lg text-sm h-18"
                      placeholder="What made this place unforgettable..."
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addNewLoveMapLocation}
                className="w-full p-4 border-2 border-dashed border-rose-300 rounded-2xl flex items-center justify-center gap-2 text-[#D4838A] font-bold hover:bg-rose-50 transition cursor-pointer"
              >
                <Plus size={20} /> Add New Map Location
              </button>
            </div>
          </Section>

          {/* 4. Our Love Constellation Customizer */}
          <Section title="Our Love Constellation" icon={<Star size={20} />} subtitle="Arrange the stars in your love sky with interactive layout presets and position controls">
            
            {/* Quick Layout Presets */}
            <div className="mb-6 p-4 bg-gray-900 rounded-2xl text-white border border-purple-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">✨ One-Click Constellation Shapes:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyConstellationPreset('heart')}
                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    ❤️ Romantic Heart
                  </button>
                  <button
                    onClick={() => applyConstellationPreset('cosmos')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    🌌 Stellar Galaxy
                  </button>
                  <button
                    onClick={() => applyConstellationPreset('infinity')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    ♾️ Infinite Love
                  </button>
                </div>
              </div>

              {/* Interactive Mini Sky Preview */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                  const targetIdx = activeStarPreview !== null ? activeStarPreview : 0;
                  if (formData.constellationStars && formData.constellationStars[targetIdx]) {
                    const newStars = [...formData.constellationStars];
                    newStars[targetIdx] = { ...newStars[targetIdx], x: clickX, y: clickY };
                    setFormData({ ...formData, constellationStars: newStars });
                  }
                }}
                className="relative w-full h-48 bg-gradient-to-b from-black via-[#14081E] to-black rounded-2xl overflow-hidden border border-purple-400/30 cursor-crosshair select-none"
              >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {(formData.constellationStars || []).map((star, sIdx) => {
                    if (sIdx === 0) return null;
                    const prevStar = formData.constellationStars[sIdx - 1];
                    return (
                      <line
                        key={`preview-line-${sIdx}`}
                        x1={`${prevStar.x ?? 50}%`}
                        y1={`${prevStar.y ?? 50}%`}
                        x2={`${star.x ?? 50}%`}
                        y2={`${star.y ?? 50}%`}
                        stroke="#E8B4B8"
                        strokeWidth="1.5"
                        opacity="0.5"
                      />
                    );
                  })}
                </svg>

                {(formData.constellationStars || []).map((star, sIdx) => {
                  const isSelected = activeStarPreview === sIdx;
                  return (
                    <div
                      key={star.id || sIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStarPreview(sIdx);
                      }}
                      className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex items-center justify-center z-10"
                      style={{ left: `${star.x ?? 50}%`, top: `${star.y ?? 50}%` }}
                      title={`Star #${sIdx + 1}: ${star.label || 'Star'} (${star.x ?? 50}%, ${star.y ?? 50}%)`}
                    >
                      <div
                        className={`rounded-full transition-transform ${isSelected ? 'w-4 h-4 bg-pink-300 ring-4 ring-pink-500/50 scale-125' : 'w-2.5 h-2.5 bg-white shadow-[0_0_8px_#E8B4B8] group-hover:scale-150'}`}
                      />
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap bg-black/90 px-1.5 py-0.5 rounded text-pink-200 pointer-events-none shadow-md">
                        #{sIdx + 1} {star.label || 'Star'}
                      </span>
                    </div>
                  );
                })}

                <span className="absolute bottom-2 right-2 text-[11px] text-purple-300/80 bg-black/60 px-2 py-0.5 rounded pointer-events-none">
                  💡 Click anywhere on sky to position Star #{activeStarPreview !== null ? activeStarPreview + 1 : 1}
                </span>
              </div>
            </div>

            {/* Stars List */}
            <div className="space-y-5">
              {(formData.constellationStars || []).map((star, i) => {
                const isSelected = activeStarPreview === i;
                return (
                  <div
                    key={star.id || i}
                    onClick={() => setActiveStarPreview(i)}
                    className={`p-5 bg-gray-50 rounded-2xl border transition space-y-4 ${isSelected ? 'border-purple-400 ring-2 ring-purple-200/60 bg-purple-50/20' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⭐</span>
                        <span className="text-sm font-bold text-gray-800">Star #{i + 1}: {star.label || 'Unnamed Star'}</span>
                        {isSelected && <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Active in Sky Preview</span>}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem('constellationStars', i);
                        }}
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border shadow-sm"
                      >
                        <Trash2 size={14} /> Remove Star
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Star Title / Label</label>
                        <input
                          type="text"
                          value={star.label || ''}
                          onChange={e => handleArrayChange('constellationStars', i, 'label', e.target.value)}
                          className="w-full p-2 bg-white border rounded-lg text-sm font-bold text-gray-800"
                          placeholder="e.g. First Hello, Under the Stars"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Date / Milestone</label>
                        <input
                          type="text"
                          value={star.date || ''}
                          onChange={e => handleArrayChange('constellationStars', i, 'date', e.target.value)}
                          className="w-full p-2 bg-white border rounded-lg text-sm font-medium"
                          placeholder="e.g. Aug 9, 2025"
                        />
                      </div>
                    </div>

                    {/* Position Controls: Slider + Direct Number + Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      {/* Horizontal X */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                          <span>↔ Horizontal Position (X)</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Number(star.x ?? 50)}
                              onChange={e => handleArrayChange('constellationStars', i, 'x', Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                              className="w-14 p-1 border rounded text-center text-xs font-bold bg-gray-50"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleArrayChange('constellationStars', i, 'x', Math.max(0, (Number(star.x ?? 50)) - 5))}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-600 cursor-pointer"
                          >
                            -5%
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={Number(star.x ?? 50)}
                            onChange={e => handleArrayChange('constellationStars', i, 'x', Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg accent-rose-500 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => handleArrayChange('constellationStars', i, 'x', Math.min(100, (Number(star.x ?? 50)) + 5))}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-600 cursor-pointer"
                          >
                            +5%
                          </button>
                        </div>
                      </div>

                      {/* Vertical Y */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                          <span>↕ Vertical Position (Y)</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Number(star.y ?? 50)}
                              onChange={e => handleArrayChange('constellationStars', i, 'y', Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                              className="w-14 p-1 border rounded text-center text-xs font-bold bg-gray-50"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleArrayChange('constellationStars', i, 'y', Math.max(0, (Number(star.y ?? 50)) - 5))}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-600 cursor-pointer"
                          >
                            -5%
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={Number(star.y ?? 50)}
                            onChange={e => handleArrayChange('constellationStars', i, 'y', Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg accent-rose-500 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => handleArrayChange('constellationStars', i, 'y', Math.min(100, (Number(star.y ?? 50)) + 5))}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-600 cursor-pointer"
                          >
                            +5%
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Memory / Star Story</label>
                      <textarea
                        value={star.story || ''}
                        onChange={e => handleArrayChange('constellationStars', i, 'story', e.target.value)}
                        className="w-full p-2.5 bg-white border rounded-lg text-sm h-18"
                        placeholder="What moment does this star represent..."
                      />
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addNewConstellationStar}
                className="w-full p-4 border-2 border-dashed border-purple-300 rounded-2xl flex items-center justify-center gap-2 text-purple-700 font-bold hover:bg-purple-50 transition cursor-pointer"
              >
                <Plus size={20} /> Add New Constellation Star
              </button>
            </div>
          </Section>

          {/* 5. Memory Carousel */}
          <Section title="Memory Carousel (Featured Moments)" icon={<Sparkles size={20} />} subtitle="Your featured swipeable memories with photo, location, date, and caption">
            <div className="space-y-6">
              {(formData.memories || []).map((mem, i) => {
                const isUploading = uploadingSlot === `memories-${i}`;
                return (
                  <div key={mem.id || i} className="p-4 bg-gray-50 rounded-2xl border flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      {mem.photo ? (
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-200 mb-2 shadow-inner">
                          <img src={mem.photo} alt="Memory" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full aspect-square rounded-xl bg-gray-200 flex items-center justify-center mb-2">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                      <label className={`cursor-pointer block w-full text-center p-2.5 bg-white border rounded-xl shadow-sm text-xs font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 ${isUploading ? 'opacity-70 pointer-events-none bg-amber-50' : ''}`}>
                        {isUploading ? (
                          <>
                            <Loader2 className="animate-spin text-[#D4838A]" size={16} />
                            <span className="text-xs font-semibold text-[#D4838A]">{uploadStatusMsg || 'Uploading...'}</span>
                          </>
                        ) : (
                          <>
                            <ImagePlus size={16} className="text-gray-500" />
                            <span>Upload Photo <span className="text-[10px] text-green-600">(Fast)</span></span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={e => handleSinglePhotoUpload(e, 'memories', i, 'photo')}
                        />
                      </label>
                      <input
                        type="text"
                        value={mem.photo && !mem.photo.startsWith('data:') ? mem.photo : ''}
                        onChange={e => handleArrayChange('memories', i, 'photo', e.target.value)}
                        className="w-full p-1.5 border rounded-lg text-xs mt-2 text-gray-600 bg-white"
                        placeholder="Or paste image URL"
                      />
                    </div>
                    <div className="w-full md:w-2/3 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-800">Memory #{i + 1}</h4>
                        <button onClick={() => handleRemoveItem('memories', i)} className="text-red-500 hover:text-red-700 cursor-pointer p-1"><Trash2 size={18}/></button>
                      </div>
                      <input type="text" value={mem.date || ''} onChange={e => handleArrayChange('memories', i, 'date', e.target.value)} className="w-full p-2 bg-white border rounded-lg text-sm" placeholder="Date (e.g. August 9, 2025)" />
                      <input type="text" value={mem.location || ''} onChange={e => handleArrayChange('memories', i, 'location', e.target.value)} className="w-full p-2 bg-white border rounded-lg text-sm" placeholder="Location" />
                      <textarea value={mem.caption || ''} onChange={e => handleArrayChange('memories', i, 'caption', e.target.value)} className="w-full p-2 bg-white border rounded-lg text-sm h-24" placeholder="Caption" />
                    </div>
                  </div>
                );
              })}
              <button onClick={addNewMemory} className="w-full p-4 border-2 border-dashed border-rose-300 rounded-2xl flex items-center justify-center gap-2 text-[#D4838A] font-bold hover:bg-rose-50 cursor-pointer">
                <Plus size={20} /> Add New Memory
              </button>
            </div>
          </Section>

          {/* 6. Polaroid Wall */}
          <Section title="Polaroid Wall" icon={<ImagePlus size={20} />} subtitle="Aesthetic pinboard of rotating polaroid snapshots">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.polaroidPhotos || []).map((pol, i) => {
                const isUploading = uploadingSlot === `polaroidPhotos-${i}`;
                return (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-gray-700">Polaroid #{i + 1}</h4>
                      <button onClick={() => handleRemoveItem('polaroidPhotos', i)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 size={16}/></button>
                    </div>
                    {pol.src ? (
                      <img src={pol.src} alt="Polaroid" className="w-full h-40 object-cover rounded-xl shadow-sm" />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400">No Image</div>
                    )}
                    <label className={`cursor-pointer block w-full text-center p-2 bg-white border rounded-xl shadow-sm text-xs font-bold hover:bg-gray-50 transition flex items-center justify-center gap-1.5 ${isUploading ? 'opacity-70 pointer-events-none bg-amber-50' : ''}`}>
                      {isUploading ? (
                        <>
                          <Loader2 className="animate-spin text-[#D4838A]" size={14} />
                          <span className="text-xs font-semibold text-[#D4838A]">{uploadStatusMsg || 'Uploading...'}</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={14} className="text-gray-500" />
                          <span>Upload Photo <span className="text-[10px] text-green-600 font-medium">(Fast)</span></span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={e => handleSinglePhotoUpload(e, 'polaroidPhotos', i, 'src')}
                      />
                    </label>
                    <input
                      type="text"
                      value={pol.src && !pol.src.startsWith('data:') ? pol.src : ''}
                      onChange={e => handleArrayChange('polaroidPhotos', i, 'src', e.target.value)}
                      className="w-full p-1.5 border rounded-lg text-xs text-gray-600 bg-white"
                      placeholder="Or paste image URL"
                    />
                    <input type="text" value={pol.caption || ''} onChange={e => handleArrayChange('polaroidPhotos', i, 'caption', e.target.value)} className="w-full p-2 bg-white border rounded-lg text-sm" placeholder="Caption" />
                  </div>
                );
              })}
              <button onClick={addNewPolaroid} className="h-full min-h-[200px] border-2 border-dashed border-rose-300 rounded-2xl flex items-center justify-center gap-2 text-[#D4838A] font-bold hover:bg-rose-50 cursor-pointer">
                <Plus size={20} /> Add Polaroid
              </button>
            </div>
          </Section>

          {/* 7. Vault Gallery */}
          <Section title="Photo Vault Gallery" icon={<ImagePlus size={20} />} subtitle="Full photo grid celebrating your adventures">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(formData.photos || []).map((photoUrl, i) => {
                const isUploading = uploadingSlot === `photos-${i}`;
                return (
                  <div key={i} className="relative group p-2 bg-gray-50 rounded-2xl border flex flex-col gap-2">
                    <button onClick={() => handleRemoveItem('photos', i)} className="absolute top-4 right-4 bg-white p-1 rounded-full text-red-500 shadow hover:text-red-700 z-10 cursor-pointer"><Trash2 size={14}/></button>
                    {photoUrl ? (
                      <img src={photoUrl} alt="Vault" className="w-full h-24 object-cover rounded-xl shadow-inner" />
                    ) : (
                      <div className="w-full h-24 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                    <label className={`cursor-pointer block w-full text-center p-1 bg-white border rounded-xl shadow-sm text-xs font-bold hover:bg-gray-50 transition flex items-center justify-center gap-1 ${isUploading ? 'opacity-70 pointer-events-none bg-amber-50' : ''}`}>
                      {isUploading ? (
                        <>
                          <Loader2 className="animate-spin text-[#D4838A]" size={12} />
                          <span className="text-[10px] text-[#D4838A]">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={12} className="text-gray-500" />
                          <span>Upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={e => handleSinglePhotoUpload(e, 'photos', i, null)}
                      />
                    </label>
                    <input
                      type="text"
                      value={photoUrl && !photoUrl.startsWith('data:') ? photoUrl : ''}
                      onChange={e => handleArrayChange('photos', i, null, e.target.value)}
                      className="w-full p-1 border rounded text-[11px] text-gray-600 bg-white"
                      placeholder="Or URL"
                    />
                  </div>
                );
              })}
              <button onClick={addNewVaultPhoto} className="h-full min-h-[100px] border-2 border-dashed border-rose-300 rounded-2xl flex items-center justify-center gap-1 text-[#D4838A] hover:bg-rose-50 text-sm font-bold cursor-pointer">
                <Plus size={16} /> Add Photo
              </button>
            </div>
          </Section>

          {/* 8. The Love Letter & Song */}
          <Section title="Love Letter & Song" icon={<Heart size={20} />} subtitle="The heartfelt letter and special song">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Our Song Name</label>
                  <input type="text" name="song" value={formData.song || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium" placeholder="Perfect" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Artist Name</label>
                  <input type="text" name="songArtist" value={formData.songArtist || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium" placeholder="Ed Sheeran" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">The Love Letter</label>
                <textarea name="loveLetterText" value={formData.loveLetterText || ''} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-2xl h-44 font-serif text-sm leading-relaxed" />
              </div>
            </div>
          </Section>

          {/* Bottom Save Button */}
          <div className="mt-12 pt-8 border-t">
            {shareLink ? (
              <div className="p-6 bg-green-50 rounded-2xl text-center border border-green-200 shadow-sm">
                <p className="text-green-800 font-bold mb-4 text-xl">🎉 Your Custom Link is Ready!</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href={shareLink} target="_blank" className="text-blue-600 underline text-lg font-medium break-all" rel="noreferrer">{shareLink}</a>
                  <button onClick={() => copyToClipboard(shareLink)} className="px-6 py-2 bg-white border border-green-300 rounded-full shadow hover:bg-green-100 transition font-bold text-green-700 cursor-pointer flex items-center gap-2">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="text-sm text-green-700 mt-4">Anyone with this link will see your customized version of the site!</p>
              </div>
            ) : (
              <button 
                onClick={saveConfig} 
                disabled={saving || !!uploadingSlot}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white text-xl font-bold transition shadow-xl hover:opacity-95 cursor-pointer disabled:opacity-50"
                style={{ background: saving ? '#ccc' : '#D4838A' }}
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                {saving ? 'Generating Link...' : 'Save & Generate Shareable Link'}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Floating Sticky Save Bar at the Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-40 flex items-center justify-between max-w-4xl mx-auto rounded-t-3xl">
        <div className="text-sm">
          {uploadingSlot ? (
            <span className="flex items-center gap-2 text-amber-600 font-semibold">
              <Loader2 className="animate-spin" size={16} />
              {uploadStatusMsg || 'Uploading image...'}
            </span>
          ) : shareLink ? (
            <span className="flex items-center gap-2 text-green-600 font-semibold">
              <Check size={16} />
              Custom Link Ready!
            </span>
          ) : (
            <span className="text-gray-500 text-xs sm:text-sm">
              Ready to generate your custom celebration link
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {shareLink ? (
            <>
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow transition cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied Link' : 'Copy Link'}
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition"
              >
                <ExternalLink size={16} />
                Open
              </a>
            </>
          ) : (
            <button
              onClick={saveConfig}
              disabled={saving || !!uploadingSlot}
              className="px-6 py-2.5 bg-[#D4838A] hover:bg-[#c37279] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Generating...' : 'Save & Generate Link'}
            </button>
          )}
        </div>
      </div>

      {/* Success Modal Popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
              Your Custom Link is Ready!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              All your dates, map locations, constellation stars, and photos have been saved. Share this unique link with your partner!
            </p>

            <div className="p-3 bg-gray-50 border rounded-xl font-mono text-xs text-gray-700 break-all select-all mb-6">
              {shareLink}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Link'}
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <ExternalLink size={18} />
                Open Site
              </a>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
            >
              Close this window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
