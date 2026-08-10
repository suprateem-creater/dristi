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
  const [activeTab, setActiveTab] = useState('core');
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
        loveQuiz: Array.isArray(data.loveQuiz) ? data.loveQuiz : prev.loveQuiz,
        quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : prev.quizQuestions,
        loveReasons: Array.isArray(data.loveReasons) ? data.loveReasons : prev.loveReasons,
        timeline: Array.isArray(data.timeline) ? data.timeline : prev.timeline,
        openWhenCards: Array.isArray(data.openWhenCards) ? data.openWhenCards : prev.openWhenCards,
        futureDreams: Array.isArray(data.futureDreams) ? data.futureDreams : prev.futureDreams,
        randomMessages: Array.isArray(data.randomMessages) ? data.randomMessages : prev.randomMessages,
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

  const addNewQuizQuestion = () => {
    const currentList = formData.loveQuiz || formData.quizQuestions || [];
    const newQ = {
      question: 'New Question?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 0
    };
    setFormData({
      ...formData,
      loveQuiz: [...currentList, newQ],
      quizQuestions: [...currentList, newQ],
    });
  };

  const handleQuizQuestionChange = (qIndex, field, value) => {
    const currentList = [...(formData.loveQuiz || formData.quizQuestions || [])];
    currentList[qIndex] = { ...currentList[qIndex], [field]: value };
    setFormData({
      ...formData,
      loveQuiz: currentList,
      quizQuestions: currentList,
    });
  };

  const handleQuizOptionChange = (qIndex, optIndex, value) => {
    const currentList = [...(formData.loveQuiz || formData.quizQuestions || [])];
    const newOpts = [...(currentList[qIndex].options || [])];
    newOpts[optIndex] = value;
    currentList[qIndex] = { ...currentList[qIndex], options: newOpts };
    setFormData({
      ...formData,
      loveQuiz: currentList,
      quizQuestions: currentList,
    });
  };

  const handleRemoveQuizQuestion = (qIndex) => {
    const currentList = (formData.loveQuiz || formData.quizQuestions || []).filter((_, i) => i !== qIndex);
    setFormData({
      ...formData,
      loveQuiz: currentList,
      quizQuestions: currentList,
    });
  };

  const addNewLoveReason = () => {
    const newReason = { front: 'New Reason Title', back: 'Describe this reason in detail...' };
    setFormData({ ...formData, loveReasons: [...(formData.loveReasons || []), newReason] });
  };

  const addNewTimelineItem = () => {
    const newItem = { date: 'Aug 9, 2026', event: 'First Event', icon: '💌', desc: 'Describe the milestone...' };
    setFormData({ ...formData, timeline: [...(formData.timeline || []), newItem] });
  };

  const addNewOpenWhenCard = () => {
    const newCard = { label: 'Open when you need me', icon: '✉️', message: 'Write your heartfelt message here...' };
    setFormData({ ...formData, openWhenCards: [...(formData.openWhenCards || []), newCard] });
  };

  const addNewFutureDream = () => {
    const newDream = { title: 'New Dream', desc: 'Describe this bucket list item...' };
    setFormData({ ...formData, futureDreams: [...(formData.futureDreams || []), newDream] });
  };

  const addNewRandomMessage = () => {
    setFormData({ ...formData, randomMessages: [...(formData.randomMessages || []), 'A sweet little love note...'] });
  };

  const addNewHeartbeatMessage = () => {
    const current = formData.heartbeatMessages || [
      "You make my heart race. ❤️",
      "Still choosing you every single day.",
      "My favorite place is in your arms.",
      "365 days and I'm still falling for you.",
      "Every single beat belongs to you.",
      "You are my whole universe. ✨"
    ];
    setFormData({ ...formData, heartbeatMessages: [...current, 'A new heartbeat message...'] });
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
        loveQuiz: formData.loveQuiz || formData.quizQuestions || (couple?.loveQuiz || []),
        quizQuestions: formData.loveQuiz || formData.quizQuestions || (couple?.quizQuestions || []),
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
    <div className="mb-12 p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-2xl relative overflow-hidden" style={{ background: 'rgba(15, 7, 23, 0.25)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.5)' }}>
      <div className="flex items-center gap-3 mb-2 pb-3 border-b border-white/5">
        {icon && <div className="p-2 rounded-xl bg-rose-500/10 text-rose-300">{icon}</div>}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold font-serif text-[#EAD6C3]">{title}</h2>
          {subtitle && <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="pt-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 relative overflow-hidden font-sans" style={{ background: 'linear-gradient(180deg, #07020d 0%, #0d0617 50%, #07020d 100%)', color: '#FAF6F0' }}>
      {/* Background radial overlays for luxury depth */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-radial from-rose-500/5 to-transparent blur-3xl pointer-events-none z-0" style={{ left: '20%', top: '15%' }} />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-radial from-amber-400/3 to-transparent blur-3xl pointer-events-none z-0" style={{ right: '20%', bottom: '25%' }} />
      
      <style>{`
        /* Dynamic Dark Theme Overrides for Inputs & Form Blocks */
        input[type="text"],
        input[type="date"],
        input[type="number"],
        input[type="email"],
        select,
        textarea {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #FAF6F0 !important;
          border-radius: 12px !important;
          outline: none !important;
          transition: all 0.3s ease !important;
        }
        input[type="text"]:focus,
        input[type="date"]:focus,
        input[type="number"]:focus,
        input[type="email"]:focus,
        select:focus,
        textarea:focus {
          border-color: #EAD6C3 !important;
          background: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 0 12px rgba(234, 214, 195, 0.2) !important;
        }
        /* Custom labels & descriptions */
        label {
          color: rgba(255, 255, 255, 0.5) !important;
          font-weight: 600 !important;
          letter-spacing: 0.05em !important;
        }
        .text-gray-500,
        .text-gray-600,
        .text-slate-500 {
          color: rgba(255, 255, 255, 0.45) !important;
        }
        /* Override form container blocks */
        .bg-purple-50\\/60,
        .bg-rose-50\\/60,
        .bg-amber-50\\/50,
        .bg-blue-50\\/50,
        .bg-gray-50,
        .bg-white {
          background: rgba(15, 7, 23, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          border-radius: 16px !important;
        }
        /* Override border colors globally for form blocks */
        .border,
        .border-rose-100,
        .border-slate-200,
        .border-purple-200,
        .border-amber-200 {
          border-color: rgba(255, 255, 255, 0.06) !important;
        }
        /* Dropdown options rendering */
        select option {
          background: #0f0717 !important;
          color: #FAF6F0 !important;
        }
        /* Delete buttons */
        .text-red-500 {
          color: #F43F5E !important;
        }
        .text-red-500:hover {
          color: #E11D48 !important;
        }
        /* Save / Action buttons */
        .bg-rose-500 {
          background: linear-gradient(135deg, #FF758F 0%, #E11D48 100%) !important;
          border: none !important;
        }
        .bg-rose-600 {
          background: #E11D48 !important;
        }
        .text-rose-700 {
          color: #FF758F !important;
        }
        .bg-rose-50 {
          background: rgba(255, 117, 143, 0.1) !important;
          border-color: rgba(255, 117, 143, 0.2) !important;
        }
        .hover\\:bg-rose-100:hover {
          background: rgba(255, 117, 143, 0.2) !important;
        }
        /* Grid lists */
        .border-dashed {
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        .hover\\:bg-rose-50\\/50:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: #EAD6C3 !important;
        }
        .text-rose-600 {
          color: #EAD6C3 !important;
        }
        .bg-purple-100, .bg-rose-100, .bg-amber-100 {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #EAD6C3 !important;
        }
        .text-purple-900, .text-purple-700, .text-amber-900, .text-rose-800 {
          color: #EAD6C3 !important;
        }
        /* Bottom floating sticky save bar override */
        .fixed.bottom-0 {
          background: rgba(15, 7, 23, 0.95) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 -15px 40px rgba(0, 0, 0, 0.8) !important;
        }
        .fixed.bottom-0 .text-slate-500,
        .fixed.bottom-0 .text-emerald-600 {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .fixed.bottom-0 .bg-slate-50 {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #FAF6F0 !important;
        }
        .fixed.bottom-0 .bg-slate-50:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 backdrop-blur-2xl" style={{ background: 'rgba(15, 7, 23, 0.25)' }}>
          <div>
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-widest flex items-center gap-2 font-serif text-[#EAD6C3]" style={{ textShadow: '0 0 15px rgba(234, 214, 195, 0.25)' }}>
              Site Customizer <Sparkles className="text-rose-300 animate-pulse" size={22} />
            </h1>
            <p className="text-xs text-white/50 mt-1.5 font-sans">
              Personalize every single date, map location, constellation star, memory, and message.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportConfigJson}
              title="Download backup file of your customized site"
              className="px-3.5 py-2 rounded-xl border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5 transition flex items-center gap-1.5 cursor-pointer shadow-sm bg-transparent"
            >
              <Download size={14} /> Export Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Load a previously saved backup file"
              className="px-3.5 py-2 rounded-xl border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5 transition flex items-center gap-1.5 cursor-pointer shadow-sm bg-transparent"
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
              className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-300/30 text-rose-300 text-xs font-bold hover:bg-rose-900/40 transition shadow-sm"
            >
              ← View Live Site
            </Link>
          </div>
        </div>

        {/* Top Link Banner if generated */}
        {shareLink && (
          <div ref={linkRef} className="mb-8 p-6 rounded-3xl border border-rose-500/20 shadow-2xl backdrop-blur-2xl relative overflow-hidden" style={{ background: 'rgba(244, 63, 94, 0.05)' }}>
            <div className="flex items-center gap-2 text-rose-300 font-bold text-lg mb-2">
              <Sparkles className="text-rose-300" size={20} />
              <span className="font-serif">Your Custom Shareable Link is Ready!</span>
            </div>
            <p className="text-sm text-white/60 mb-4 font-sans">
              Share this permanent link with your partner. All your photos, dates, map, and constellation are live!
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 p-3 bg-slate-950/50 border border-white/10 rounded-xl text-sm font-mono text-white select-all shadow-inner"
              />
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="px-6 py-3 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow transition cursor-pointer border-none"
                style={{ background: 'linear-gradient(135deg, #FF758F 0%, #E11D48 100%)' }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ExternalLink size={18} />
                Open Site
              </a>
            </div>
          </div>
        )}

        {/* Main Grid Layout: Sidebar Tab Selector (sticky on large screens) + Active Editor Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tabs Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 p-5 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-2xl space-y-4" style={{ background: 'rgba(15, 7, 23, 0.25)' }}>
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EAD6C3]/60 px-1">Navigation</h3>
              <p className="text-[10px] text-white/40 px-1 mt-0.5">Customize your anniversary site page by page</p>
            </div>
            
            {/* Scrollable list on mobile, stack on desktop */}
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
              {[
                { id: 'core', label: '💕 Core Info', desc: 'Names, dates & songs' },
                { id: 'capsule', label: '🔒 Capsule & Quiz', desc: 'Sealed notes & quizzes' },
                { id: 'photos', label: '📸 Photos & Memories', desc: 'Carousel & pinboard' },
                { id: 'mapsky', label: '🗺️ Map & Sky', desc: 'Love map & constellation' },
                { id: 'stories', label: '✨ Lists & Stories', desc: 'Timeline, reasons & dreams' },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left w-auto lg:w-full cursor-pointer border-none ${
                      isActive 
                        ? 'text-[#1A0923] shadow-lg scale-[1.02]' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white bg-white/5 lg:bg-transparent'
                    }`}
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, #EAD6C3 0%, #CDB39B 100%)' 
                        : '',
                    }}
                  >
                    <span className="text-base">{tab.label.split(' ')[0]}</span>
                    <div className="hidden lg:block text-left">
                      <div className="font-bold leading-tight">{tab.label.split(' ').slice(1).join(' ')}</div>
                      <div className={`text-[10px] font-normal leading-tight mt-0.5 ${isActive ? 'text-[#1A0923]/70' : 'text-white/40'}`}>{tab.desc}</div>
                    </div>
                    {/* Fallback label for smaller screens */}
                    <span className="lg:hidden font-bold">{tab.label.split(' ').slice(1).join(' ')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeTab === 'core' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                
                {/* 1. Basic Names & Initials */}
                <Section title="Couple Names & Initials" icon={<Heart size={20} />} subtitle="Personalize the names across the entire site">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Partner 1</label>
                      <input type="text" name="partner1" value={formData.partner1 || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-gray-800 text-sm focus:ring-2 focus:ring-rose-200 focus:bg-white transition shadow-sm" placeholder="Dristi" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Partner 2</label>
                      <input type="text" name="partner2" value={formData.partner2 || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-gray-800 text-sm focus:ring-2 focus:ring-rose-200 focus:bg-white transition shadow-sm" placeholder="Vedant" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Initials Animation</label>
                      <input type="text" name="initials" value={formData.initials || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-gray-800 text-sm focus:ring-2 focus:ring-rose-200 focus:bg-white transition shadow-sm" placeholder="D ♡ V" />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Hero Display Title (Use newlines for multiple lines)</label>
                    <textarea 
                      name="heroTitle" 
                      value={formData.heroTitle || '365 Days\nof Us'} 
                      onChange={handleChange} 
                      className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-gray-800 text-sm focus:ring-2 focus:ring-rose-200 focus:bg-white transition shadow-sm h-16" 
                      placeholder="e.g. 365 Days&#10;of Us" 
                    />
                  </div>
                </Section>

                {/* 2. Custom Date & Countdown Timers */}
                <Section title="Important Dates & Milestones" icon={<Calendar size={20} />} subtitle="Set your Anniversary date and relationship milestones">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Anniversary Date */}
                    <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-3 md:col-span-2 shadow-xs">
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
                            className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-sm font-bold text-gray-800 shadow-sm cursor-pointer focus:ring-2 focus:ring-rose-300 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">✍️ Or Edit Formatted Date Text:</label>
                          <input
                            type="text"
                            name="anniversaryDate"
                            value={formData.anniversaryDate || ''}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-rose-300 transition"
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
                        className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-sm text-gray-800 focus:ring-2 focus:ring-rose-200 focus:bg-white transition"
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
                        className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-sm text-gray-800 focus:ring-2 focus:ring-rose-200 focus:bg-white transition"
                        placeholder="e.g. A sunset walk at the botanical garden"
                      />
                    </div>
                  </div>
                </Section>

                {/* 3. The Love Letter & Song */}
                <Section title="Love Letter & Our Song" icon={<Heart size={20} />} subtitle="The heartfelt letter and special song">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Our Song Name</label>
                        <input type="text" name="song" value={formData.song || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-gray-800 text-sm focus:ring-2 focus:ring-rose-200 focus:bg-white transition" placeholder="Perfect" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Artist Name</label>
                        <input type="text" name="songArtist" value={formData.songArtist || ''} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border rounded-xl font-medium text-gray-800 text-sm focus:ring-2 focus:ring-rose-200 focus:bg-white transition" placeholder="Ed Sheeran" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">The Love Letter</label>
                      <textarea name="loveLetterText" value={formData.loveLetterText || ''} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-2xl h-44 font-serif text-sm text-gray-800 leading-relaxed focus:ring-2 focus:ring-rose-200 focus:bg-white transition" />
                    </div>
                  </div>
                </Section>

                {/* 4. Random Love Notes Generator */}
                <Section title="Love Notes Generator" icon={<Sparkles size={20} />} subtitle="Personalize the sweet random love notes generated on button clicks">
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">Add cute, short reminder text messages that your partner can generate with a button click.</p>
                    {(formData.randomMessages || []).map((msg, rmIdx) => (
                      <div key={rmIdx} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-bold w-6">#{rmIdx + 1}</span>
                        <input
                          type="text"
                          value={msg || ''}
                          onChange={e => handleArrayChange('randomMessages', rmIdx, null, e.target.value)}
                          className="flex-1 p-2 bg-white border rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-rose-200 transition"
                          placeholder="Write a sweet short love note..."
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('randomMessages', rmIdx)}
                          className="text-red-500 hover:text-red-700 cursor-pointer p-2 bg-white border rounded-xl shadow-sm hover:bg-rose-50 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addNewRandomMessage}
                      className="w-full p-3 border-2 border-dashed border-rose-300 rounded-2xl flex items-center justify-center gap-2 text-[#D4838A] font-bold hover:bg-rose-50 transition cursor-pointer text-xs"
                    >
                      <Plus size={16} /> Add New Love Note
                    </button>
                  </div>
                </Section>
              </div>
            )}

            {activeTab === 'capsule' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                
                {/* 5. Time Capsule Customizer */}
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
                            className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-sm font-bold text-gray-800 shadow-sm cursor-pointer focus:ring-2 focus:ring-purple-300 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">✍️ Or Edit Unlock Date Text:</label>
                          <input
                            type="text"
                            value={typeof formData.timeCapsuleDate === 'string' ? formData.timeCapsuleDate : (formData.timeCapsuleDate ? new Date(formData.timeCapsuleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'September 15, 2026')}
                            onChange={(e) => setFormData({ ...formData, timeCapsuleDate: e.target.value })}
                            className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-purple-300 transition"
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
                          className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-200 transition"
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
                          className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-purple-200 transition"
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
                        className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-purple-200 transition"
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
                          className="w-full p-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-amber-200 transition"
                          placeholder="Headline"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Capsule Unlocked Message Content</label>
                        <textarea
                          name="timeCapsuleMessage"
                          value={formData.timeCapsuleMessage || ''}
                          onChange={handleChange}
                          className="w-full p-3 bg-white border border-amber-300 rounded-2xl text-sm text-gray-800 h-28 leading-relaxed focus:ring-2 focus:ring-amber-200 transition"
                          placeholder="Your anniversary note..."
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                {/* 6. Interactive Quiz Customizer */}
                <Section title="Anniversary Memory Quiz" icon={<Sparkles size={20} />} subtitle="Personalize the questions, multiple-choice options, and correct answers for your quiz">
                  <div className="space-y-6">
                    <p className="text-xs text-gray-500">Create a quiz to test your partner on special dates, trivia, or memories. They will see it embedded on the timeline!</p>
                    {(formData.loveQuiz || formData.quizQuestions || []).map((q, qIdx) => (
                      <div key={qIdx} className="p-5 bg-white rounded-2xl border border-rose-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded-full font-bold">Question #{qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizQuestion(qIdx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border shadow-sm"
                          >
                            <Trash2 size={14} /> Remove Question
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Question Prompt</label>
                          <input
                            type="text"
                            value={q.question || ''}
                            onChange={e => handleQuizQuestionChange(qIdx, 'question', e.target.value)}
                            className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-rose-200 focus:bg-white transition"
                            placeholder="e.g. Where was our very first date?"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(q.options || []).map((opt, optIdx) => (
                            <div key={optIdx}>
                              <label className="block text-xs font-bold text-gray-500 mb-0.5">Option {['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}</label>
                              <input
                                type="text"
                                value={opt || ''}
                                onChange={e => handleQuizOptionChange(qIdx, optIdx, e.target.value)}
                                className="w-full p-2 bg-gray-50 border rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-rose-200 focus:bg-white transition"
                                placeholder={`Option ${['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <label className="block text-xs font-bold text-gray-600 mb-1">⭐ Correct Option / Answer:</label>
                          <select
                            value={q.correct ?? 0}
                            onChange={e => handleQuizQuestionChange(qIdx, 'correct', Number(e.target.value))}
                            className="w-full sm:w-64 p-2.5 text-xs border rounded-xl bg-white font-medium text-gray-700 cursor-pointer shadow-sm focus:ring-2 focus:ring-rose-200"
                          >
                            {(q.options || []).map((_, optIdx) => (
                              <option key={optIdx} value={optIdx}>Option {['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addNewQuizQuestion}
                      className="w-full p-4 border-2 border-dashed border-rose-300 rounded-2xl flex items-center justify-center gap-2 text-[#D4838A] font-bold hover:bg-rose-50 transition cursor-pointer text-xs"
                    >
                      <Plus size={16} /> Add New Quiz Question
                    </button>
                  </div>
                </Section>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans">
                
                {/* 7. Memory Carousel */}
                <Section title="Memory Carousel (Featured Moments)" icon={<Sparkles size={20} />} subtitle="Your featured swipeable memories with photo, location, date, and caption.">
                  <div className="space-y-6">
                    <p className="text-xs text-slate-400 font-sans">Upload key story moments that will be shown in the high-fidelity sliding memory deck.</p>
                    
                    <div className="space-y-4">
                      {(formData.memories || []).map((mem, i) => {
                        const isUploading = uploadingSlot === `memories-${i}`;
                        return (
                          <div key={mem.id || i} className="p-5 bg-slate-50/30 rounded-xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row gap-6">
                            {/* Photo Upload Side */}
                            <div className="w-full md:w-1/3 space-y-2 font-sans">
                              {mem.photo ? (
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white shadow-inner border border-slate-250">
                                  <img src={mem.photo} alt="Memory" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-full aspect-square rounded-xl bg-white border border-dashed border-slate-350 flex flex-col items-center justify-center text-xs text-slate-400">
                                  <span>No Image Uploaded</span>
                                </div>
                              )}
                              
                              <label className={`cursor-pointer block w-full text-center py-2 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/65 rounded-xl text-rose-700 text-xs font-bold transition flex items-center justify-center gap-2 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                                {isUploading ? (
                                  <>
                                    <Loader2 className="animate-spin text-rose-700" size={14} />
                                    <span>{uploadStatusMsg || 'Uploading...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <ImagePlus size={14} className="text-rose-500" />
                                    <span>Upload Photo</span>
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
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition"
                                placeholder="Or paste image URL"
                              />
                            </div>
                            
                            {/* Inputs Side */}
                            <div className="w-full md:w-2/3 space-y-4 font-sans">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider font-sans font-sans">Memory #{i + 1}</h4>
                                <button 
                                  onClick={() => handleRemoveItem('memories', i)} 
                                  className="text-red-500 hover:text-red-700 bg-white border border-slate-200 hover:bg-slate-50 p-1.5 rounded-xl cursor-pointer shadow-xs transition"
                                >
                                  <Trash2 size={14}/>
                                </button>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-500">Date text</label>
                                <input type="text" value={mem.date || ''} onChange={e => handleArrayChange('memories', i, 'date', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" placeholder="e.g. August 9, 2025" />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-500">Location</label>
                                <input type="text" value={mem.location || ''} onChange={e => handleArrayChange('memories', i, 'location', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" placeholder="e.g. Rome, Italy" />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-500 font-sans">Caption text</label>
                                <textarea value={mem.caption || ''} onChange={e => handleArrayChange('memories', i, 'caption', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs h-20 leading-relaxed" placeholder="Describe the memory..." />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button 
                      onClick={addNewMemory} 
                      className="w-full py-3 border border-dashed border-rose-300 hover:border-rose-400 rounded-xl flex items-center justify-center gap-2 text-rose-600 font-bold hover:bg-rose-50/50 transition cursor-pointer text-xs"
                    >
                      <Plus size={14} /> Add New Memory
                    </button>
                  </div>
                </Section>
 
                {/* 8. Polaroid Wall */}
                <Section title="Polaroid Wall" icon={<ImagePlus size={20} />} subtitle="Aesthetic pinboard of rotating polaroid snapshots.">
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-sans font-sans">Configure polaroid snapshot style cards with custom hand-written style titles.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(formData.polaroidPhotos || []).map((pol, i) => {
                        const isUploading = uploadingSlot === `polaroidPhotos-${i}`;
                        return (
                          <div key={i} className="p-4 bg-slate-50/30 rounded-xl border border-slate-200/60 shadow-xs flex flex-col gap-3 font-sans">
                            <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-sans font-sans">Polaroid Card #{i + 1}</h4>
                              <button 
                                onClick={() => handleRemoveItem('polaroidPhotos', i)} 
                                className="text-red-500 hover:text-red-700 cursor-pointer p-1.5 hover:bg-slate-55 bg-white border border-slate-200 rounded-lg shadow-xs transition"
                              >
                                <Trash2 size={13}/>
                              </button>
                            </div>
                            
                            {pol.src ? (
                              <img src={pol.src} alt="Polaroid" className="w-full h-40 object-cover rounded-lg shadow-sm border border-slate-200" />
                            ) : (
                              <div className="w-full h-40 bg-white border border-dashed border-slate-350 rounded-lg flex items-center justify-center text-xs text-slate-400">No Image Uploaded</div>
                            )}
                            
                            <label className={`cursor-pointer block w-full text-center py-2 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/65 rounded-xl text-rose-707 text-xs font-bold transition flex items-center justify-center gap-1.5 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                              {isUploading ? (
                                <>
                                  <Loader2 className="animate-spin text-rose-700" size={14} />
                                  <span>{uploadStatusMsg || 'Uploading...'}</span>
                                </>
                              ) : (
                                <>
                                  <ImagePlus size={14} className="text-rose-500" />
                                  <span>Upload Photo</span>
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
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-505 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition"
                              placeholder="Or paste image URL"
                            />
                            
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans font-sans">Hand-written Caption</label>
                              <input type="text" value={pol.caption || ''} onChange={e => handleArrayChange('polaroidPhotos', i, 'caption', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" placeholder="e.g. Rome 2025" />
                            </div>
                          </div>
                        );
                      })}
                      
                      <button 
                        onClick={addNewPolaroid} 
                        className="h-full min-h-[260px] border border-dashed border-rose-300 hover:border-rose-450 hover:bg-rose-50/50 rounded-xl flex flex-col items-center justify-center gap-2 text-rose-600 font-bold transition cursor-pointer text-xs p-6"
                      >
                        <Plus size={20} className="text-rose-500" />
                        <span>Add Polaroid Card</span>
                      </button>
                    </div>
                  </div>
                </Section>

                {/* 9. Vault Gallery */}
                <Section title="Photo Vault Gallery" icon={<ImagePlus size={20} />} subtitle="Full photo grid celebrating your adventures.">
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-sans font-sans">Configure the complete gallery grid of your favorite photo collection.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(formData.photos || []).map((photoUrl, i) => {
                        const isUploading = uploadingSlot === `photos-${i}`;
                        return (
                          <div key={i} className="relative group p-2.5 bg-slate-50/30 rounded-xl border border-slate-200/60 shadow-xs flex flex-col gap-2 font-sans">
                            <button 
                              onClick={() => handleRemoveItem('photos', i)} 
                              className="absolute top-4 right-4 bg-white hover:bg-red-55 p-1.5 rounded-lg text-red-500 shadow-sm border border-slate-200 hover:text-red-700 z-10 cursor-pointer transition"
                            >
                              <Trash2 size={12}/>
                            </button>
                            
                            {photoUrl ? (
                              <img src={photoUrl} alt="Vault" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                            ) : (
                              <div className="w-full h-24 bg-white border border-dashed border-slate-350 rounded-lg flex items-center justify-center text-[10px] text-slate-450">No Image</div>
                            )}
                            
                            <label className={`cursor-pointer block w-full text-center py-1 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/55 rounded-lg text-[10px] font-bold text-rose-707 transition flex items-center justify-center gap-1 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                              {isUploading ? (
                                <Loader2 className="animate-spin text-rose-700" size={10} />
                              ) : (
                                <ImagePlus size={10} />
                              )}
                              <span>{isUploading ? '...' : 'Upload'}</span>
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
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-505 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                              placeholder="Or paste URL"
                            />
                          </div>
                        );
                      })}
                      
                      <button 
                        onClick={addNewVaultPhoto} 
                        className="h-full min-h-[160px] border border-dashed border-rose-300 hover:border-rose-450 hover:bg-rose-50/50 rounded-xl flex flex-col items-center justify-center gap-1 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer transition p-4 font-sans"
                      >
                        <Plus size={16} className="text-rose-500" />
                        <span>Add Photo</span>
                      </button>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {activeTab === 'mapsky' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans">
                
                {/* 10. Our Love Map */}
                <Section title="Our Love Map" icon={<MapPin size={20} />} subtitle="Map special coordinates where your love stories occurred.">
                  <div className="space-y-6">
                    <p className="text-xs text-slate-400 font-sans">Pick city presets to auto-fill latitude and longitude coordinates automatically, or input custom ones.</p>
                    
                    <div className="space-y-4">
                      {(formData.loveMap || []).map((loc, i) => (
                        <div key={i} className="p-5 bg-slate-50/30 rounded-xl border border-slate-200/60 shadow-xs space-y-4 font-sans">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-105">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{loc.emoji || '💖'}</span>
                              <span className="text-sm font-bold text-slate-700">{loc.name || 'Special Location'}</span>
                            </div>
                            <button 
                              onClick={() => handleRemoveItem('loveMap', i)} 
                              className="text-red-500 hover:text-red-750 border border-slate-200 p-1.5 rounded-xl cursor-pointer bg-white shadow-xs transition hover:bg-slate-50"
                            >
                              <Trash2 size={14}/>
                            </button>
                          </div>

                          {/* Quick Presets Dropdown */}
                          <div className="p-3.5 bg-rose-50/30 rounded-xl border border-rose-100/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <span className="text-xs font-bold text-rose-800 tracking-wider">⚡ AUTO-FILL PRESET CITY</span>
                            <select
                              onChange={e => {
                                const cityIndex = Number(e.target.value);
                                if (cityIndex > 0) {
                                  setMapPreset(i, POPULAR_CITIES[cityIndex]);
                                }
                              }}
                              className="px-2 py-1 text-xs border border-rose-205 rounded-lg bg-white font-semibold text-rose-700 cursor-pointer shadow-xs focus:outline-none"
                            >
                              {POPULAR_CITIES.map((city, cIdx) => (
                                <option key={cIdx} value={cIdx}>{city.emoji} {city.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Place Name</label>
                              <input type="text" value={loc.name || ''} onChange={e => handleArrayChange('loveMap', i, 'name', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" placeholder="Rome, Italy" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emoji Icon</label>
                              <input type="text" value={loc.emoji || ''} onChange={e => handleArrayChange('loveMap', i, 'emoji', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" placeholder="🌸" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latitude</label>
                              <input type="number" step="0.0001" value={loc.coords?.[0] || 0} onChange={e => handleArrayChange('loveMap', i, 'coords', [Number(e.target.value), loc.coords?.[1] || 0])} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Longitude</label>
                              <input type="number" step="0.0001" value={loc.coords?.[1] || 0} onChange={e => handleArrayChange('loveMap', i, 'coords', [loc.coords?.[0] || 0, Number(e.target.value)])} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Milestone Date</label>
                              <input type="text" value={loc.date || ''} onChange={e => handleArrayChange('loveMap', i, 'date', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" placeholder="e.g. Aug 9, 2025" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">The Place Story</label>
                              <input type="text" value={loc.story || ''} onChange={e => handleArrayChange('loveMap', i, 'story', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 outline-none transition shadow-xs" placeholder="e.g. Where it started" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={addNewLoveMapLocation} 
                      className="w-full py-3 border border-dashed border-rose-300 hover:border-rose-450 rounded-xl flex items-center justify-center gap-2 text-rose-600 font-bold hover:bg-rose-50/50 transition cursor-pointer text-xs"
                    >
                      <Plus size={14} /> Add New Map Location
                    </button>
                  </div>
                </Section>

                {/* 11. Our Love Constellation */}
                <Section title="Our Love Constellation" icon={<Star size={20} />} subtitle="Arrange the stars in your love sky with interactive layout presets and position controls.">
                  <div className="space-y-6">
                    
                    {/* Quick Layout Presets */}
                    <div className="p-4 bg-slate-900 rounded-xl text-white border border-slate-800 shadow-sm space-y-4 font-sans">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-200 font-sans">✨ Constellation Shape Presets:</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => applyConstellationPreset('heart')}
                            className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          >
                            ❤️ Heart
                          </button>
                          <button
                            type="button"
                            onClick={() => applyConstellationPreset('cosmos')}
                            className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          >
                            🌌 Galaxy
                          </button>
                          <button
                            type="button"
                            onClick={() => applyConstellationPreset('infinity')}
                            className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          >
                            ♾️ Infinity
                          </button>
                        </div>
                      </div>

                      {/* Interactive Mini Sky Sky */}
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
                        className="relative w-full h-48 bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl overflow-hidden border border-slate-800 cursor-crosshair select-none"
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
                                stroke="#F43F5E"
                                strokeWidth="1.5"
                                opacity="0.4"
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
                                className={`rounded-full transition-transform ${isSelected ? 'w-3.5 h-3.5 bg-rose-400 ring-4 ring-rose-500/50 scale-125' : 'w-2 h-2 bg-white shadow-[0_0_8px_#F43F5E] group-hover:scale-150'}`}
                              />
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded text-rose-200 pointer-events-none shadow-md">
                                #{sIdx + 1} {star.label || 'Star'}
                              </span>
                            </div>
                          );
                        })}

                        <span className="absolute bottom-2 right-2 text-[9px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded pointer-events-none">
                          💡 Click anywhere to reposition Star #{activeStarPreview !== null ? activeStarPreview + 1 : 1}
                        </span>
                      </div>
                    </div>

                    {/* Stars List */}
                    <div className="space-y-4">
                      {(formData.constellationStars || []).map((star, i) => {
                        const isSelected = activeStarPreview === i;
                        return (
                          <div
                            key={star.id || i}
                            onClick={() => setActiveStarPreview(i)}
                            className={`p-5 bg-white rounded-xl border transition space-y-4 cursor-pointer ${isSelected ? 'border-rose-355 ring-4 ring-rose-50/50 bg-rose-50/5' : 'border-slate-200/60 shadow-xs'}`}
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-sans">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">⭐</span>
                                <span className="text-xs font-bold text-slate-700">Star #{i + 1}: {star.label || 'Unnamed Star'}</span>
                                {isSelected && <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded-full border border-rose-100 animate-pulse font-sans">Selected</span>}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveItem('constellationStars', i);
                                }}
                                className="text-red-500 hover:text-red-750 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs transition hover:bg-slate-55"
                              >
                                <Trash2 size={13} /> Remove Star
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider font-sans">Star Label</label>
                                <input
                                  type="text"
                                  value={star.label || ''}
                                  onChange={e => handleArrayChange('constellationStars', i, 'label', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-550 transition"
                                  placeholder="e.g. First Hello"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider font-sans">Date / Time</label>
                                <input
                                  type="text"
                                  value={star.date || ''}
                                  onChange={e => handleArrayChange('constellationStars', i, 'date', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-550 transition"
                                  placeholder="e.g. Aug 9, 2025"
                                />
                              </div>
                            </div>

                            {/* Position Sliders */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner font-sans">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 font-sans">
                                  <span>X Position (Horizontal)</span>
                                  <span className="bg-white px-1.5 py-0.5 rounded border text-[9px]">{star.x ?? 50}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={star.x ?? 50}
                                  onChange={e => handleArrayChange('constellationStars', i, 'x', Number(e.target.value))}
                                  className="w-full h-1 bg-slate-200 rounded-lg accent-rose-500 cursor-pointer"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 font-sans">
                                  <span>Y Position (Vertical)</span>
                                  <span className="bg-white px-1.5 py-0.5 rounded border text-[9px]">{star.y ?? 50}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={star.y ?? 50}
                                  onChange={e => handleArrayChange('constellationStars', i, 'y', Number(e.target.value))}
                                  className="w-full h-1 bg-slate-200 rounded-lg accent-rose-500 cursor-pointer"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider font-sans">Star Memory Story</label>
                              <textarea
                                value={star.story || ''}
                                onChange={e => handleArrayChange('constellationStars', i, 'story', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs h-16 text-slate-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-550 transition font-sans"
                                placeholder="Describe this star's story..."
                              />
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={addNewConstellationStar}
                        className="w-full py-3 border border-dashed border-purple-300 hover:border-purple-400 rounded-xl flex items-center justify-center gap-2 text-purple-700 font-bold hover:bg-purple-50/50 transition cursor-pointer text-xs"
                      >
                        <Plus size={14} /> Add New Constellation Star
                      </button>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {activeTab === 'stories' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans">
                {/* 12. Reasons I Love You Cards */}
                <Section title="Reasons I Love You Cards" icon={<Heart size={20} />} subtitle="Personalize the flipping cards containing things you love about them.">
                  <div className="space-y-5">
                    <p className="text-xs text-slate-400 font-sans">Add beautiful cards that flip to reveal secret reasons why you love your partner.</p>
                    
                    <div className="space-y-4 font-sans">
                      {(formData.loveReasons || []).map((reason, rIdx) => (
                        <div key={rIdx} className="p-5 bg-slate-50/30 rounded-xl border border-slate-200/60 shadow-xs space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-sans font-sans">
                            <span className="text-xs bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold">Reason Card #{rIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem('loveReasons', rIdx)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-55 transition"
                            >
                              <Trash2 size={13} /> Remove Card
                            </button>
                          </div>

                          <div className="space-y-3 font-sans">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500">Card Front (Short title, e.g. Your Kindness)</label>
                              <input
                                type="text"
                                value={reason.front || ''}
                                onChange={e => handleArrayChange('loveReasons', rIdx, 'front', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="e.g. Your Laugh"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500 font-sans">Card Back (Memory details)</label>
                              <textarea
                                value={reason.back || ''}
                                onChange={e => handleArrayChange('loveReasons', rIdx, 'back', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 h-20 leading-relaxed focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="Why is this one of the reasons you love them..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addNewLoveReason}
                      className="w-full py-3 border border-dashed border-rose-300 hover:border-rose-450 hover:bg-rose-50/50 rounded-xl flex items-center justify-center gap-2 text-rose-600 font-bold transition cursor-pointer text-xs font-sans"
                    >
                      <Plus size={14} /> Add New Reason Card
                    </button>
                  </div>
                </Section>

                {/* 13. Chapters & Milestones Timeline */}
                <Section title="Chapters & Milestones Timeline" icon={<Calendar size={20} />} subtitle="Personalize your relationship history timeline events, dates, and icons.">
                  <div className="space-y-5">
                    <p className="text-xs text-slate-400 font-sans">Define the core relationship milestones that populate the main vertical timeline.</p>
                    
                    <div className="space-y-4">
                      {(formData.timeline || []).map((item, tIdx) => (
                        <div key={tIdx} className="p-5 bg-slate-50/30 rounded-xl border border-slate-200/60 shadow-xs space-y-4 font-sans">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-sans font-sans font-sans">
                            <span className="text-xs bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold">Milestone #{tIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem('timeline', tIdx)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-55 transition"
                            >
                              <Trash2 size={13} /> Remove Event
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500">Date string</label>
                              <input
                                type="text"
                                value={item.date || ''}
                                onChange={e => handleArrayChange('timeline', tIdx, 'date', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="e.g. Aug 9, 2025"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500">Event title</label>
                              <input
                                type="text"
                                value={item.event || ''}
                                onChange={e => handleArrayChange('timeline', tIdx, 'event', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="e.g. First Meeting"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500">Emoji badge</label>
                              <input
                                type="text"
                                value={item.icon || '💌'}
                                onChange={e => handleArrayChange('timeline', tIdx, 'icon', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="e.g. 💌, 🩺, 📞"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-500">Milestone description</label>
                            <textarea
                              value={item.desc || ''}
                              onChange={e => handleArrayChange('timeline', tIdx, 'desc', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 h-16 leading-relaxed focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                              placeholder="Describe this milestone..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addNewTimelineItem}
                      className="w-full py-3 border border-dashed border-rose-300 hover:border-rose-450 hover:bg-rose-50/50 rounded-xl flex items-center justify-center gap-2 text-rose-600 font-bold transition cursor-pointer text-xs font-sans"
                    >
                      <Plus size={14} /> Add New Timeline Event
                    </button>
                  </div>
                </Section>

                {/* 14. Open When Letters */}
                <Section title="Open When Letters" icon={<Sparkles size={20} />} subtitle="Personalize the 'Open When' letter notes and envelope labels.">
                  <div className="space-y-5">
                    <p className="text-xs text-slate-400 font-sans">Configure special envelopes that contain warm letters for different emotions or occasions.</p>
                    
                    <div className="space-y-4">
                      {(formData.openWhenCards || []).map((card, owIdx) => (
                        <div key={owIdx} className="p-5 bg-slate-50/30 rounded-xl border border-slate-200/60 shadow-xs space-y-4 font-sans">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-sans">
                            <span className="text-xs bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold">Open When Letter #{owIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem('openWhenCards', owIdx)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-55 transition"
                            >
                              <Trash2 size={13} /> Remove Letter
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500 font-sans font-sans">Envelope Label (e.g. Open when you miss me)</label>
                              <input
                                type="text"
                                value={card.label || ''}
                                onChange={e => handleArrayChange('openWhenCards', owIdx, 'label', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="Open when you miss me"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500 font-sans font-sans font-sans">Emoji Icon</label>
                              <input
                                type="text"
                                value={card.icon || '✉️'}
                                onChange={e => handleArrayChange('openWhenCards', owIdx, 'icon', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="e.g. 🌙, 🌧️, 🌞"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 font-sans">
                            <label className="block text-xs font-semibold text-slate-500">Letter message content</label>
                            <textarea
                              value={card.message || ''}
                              onChange={e => handleArrayChange('openWhenCards', owIdx, 'message', e.target.value)}
                              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 h-24 font-serif leading-relaxed focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                              placeholder="Write your sweet note to read..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addNewOpenWhenCard}
                      className="w-full py-3 border border-dashed border-rose-300 hover:border-rose-455 hover:bg-rose-50/50 rounded-xl flex items-center justify-center gap-2 text-rose-600 font-bold transition cursor-pointer text-xs font-sans"
                    >
                      <Plus size={14} /> Add New Open When Letter
                    </button>
                  </div>
                </Section>

                {/* 15. Future Bucket List */}
                <Section title="Our Future Bucket List" icon={<Compass size={20} />} subtitle="Personalize the dreams and adventures waiting in your future together.">
                  <div className="space-y-5">
                    <p className="text-xs text-slate-400 font-sans font-sans">Define shared future plans or milestones that flip open dynamically.</p>
                    
                    <div className="space-y-4">
                      {(formData.futureDreams || []).map((dream, fdIdx) => (
                        <div key={fdIdx} className="p-5 bg-slate-50/30 rounded-xl border border-slate-200/60 shadow-xs space-y-4 font-sans">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-sans">
                            <span className="text-xs bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold">Dream Item #{fdIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem('futureDreams', fdIdx)}
                              className="text-red-500 hover:text-red-750 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-55 transition"
                            >
                              <Trash2 size={13} /> Remove Item
                            </button>
                          </div>

                          <div className="space-y-3 font-sans">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500">Dream Title</label>
                              <input
                                type="text"
                                value={dream.title || ''}
                                onChange={e => handleArrayChange('futureDreams', fdIdx, 'title', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="e.g. Travel the World"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-500">Dream description / details</label>
                              <textarea
                                value={dream.desc || ''}
                                onChange={e => handleArrayChange('futureDreams', fdIdx, 'desc', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 h-16 leading-relaxed focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition"
                                placeholder="Write details about this dream..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addNewFutureDream}
                      className="w-full py-3 border border-dashed border-rose-300 hover:border-rose-455 hover:bg-rose-50/50 rounded-xl flex items-center justify-center gap-2 text-rose-600 font-bold transition cursor-pointer text-xs font-sans"
                    >
                      <Plus size={14} /> Add New Bucket List Dream
                    </button>
                  </div>
                </Section>

                {/* 16. Beating Heart Section */}
                <Section title="Heartbeat Customizer" icon={<Heart className="animate-pulse text-rose-500" size={20} />} subtitle="Configure the heartbeat section titles and custom messages.">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Eyebrow Tag</label>
                        <input
                          type="text"
                          name="heartbeatEyebrow"
                          value={formData.heartbeatEyebrow || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs"
                          placeholder="Feel It"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500 font-sans">Section Title</label>
                        <input
                          type="text"
                          name="heartbeatTitle"
                          value={formData.heartbeatTitle || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs"
                          placeholder="My Heartbeat For You"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500 font-sans">Section Subtitle</label>
                        <input
                          type="text"
                          name="heartbeatSubtitle"
                          value={formData.heartbeatSubtitle || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-805 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-550 transition shadow-xs"
                          placeholder="Tap the beating heart..."
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/60 space-y-3 font-sans">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">Heartbeat Messages List</label>
                      
                      <div className="space-y-2.5">
                        {(formData.heartbeatMessages || [
                          "You make my heart race. ❤️",
                          "Still choosing you every single day.",
                          "My favorite place is in your arms.",
                          "365 days and I'm still falling for you.",
                          "Every single beat belongs to you.",
                          "You are my whole universe. ✨"
                        ]).map((msg, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={msg || ''}
                              onChange={e => handleArrayChange('heartbeatMessages', hIdx, null, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-550 transition shadow-xs"
                              placeholder="Write heartbeat note..."
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem('heartbeatMessages', hIdx)}
                              className="text-red-500 hover:text-red-750 bg-white border border-slate-200 hover:bg-slate-50 p-2.5 rounded-xl cursor-pointer shadow-xs transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        type="button"
                        onClick={addNewHeartbeatMessage}
                        className="w-full py-2.5 border border-dashed border-rose-300 hover:border-rose-455 rounded-xl flex items-center justify-center gap-2 text-rose-600 font-bold hover:bg-rose-50/50 transition cursor-pointer text-xs"
                      >
                        <Plus size={14} /> Add Heartbeat Message
                      </button>
                    </div>
                  </div>
                </Section>

                {/* 17. Love Meter Customizer */}
                <Section title="Love Meter Customizer" icon={<Sparkles size={20} />} subtitle="Configure labels, headings, and messages for the love meter slider.">
                  <div className="space-y-6 animate-in fade-in duration-200 font-sans font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Eyebrow Tag</label>
                        <input
                          type="text"
                          name="lovemeterEyebrow"
                          value={formData.lovemeterEyebrow || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs"
                          placeholder="An Important Question"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Section Title</label>
                        <input
                          type="text"
                          name="lovemeterTitle"
                          value={formData.lovemeterTitle || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="How Much Do We Love Each Other?"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Section Subtitle</label>
                        <input
                          type="text"
                          name="lovemeterSubtitle"
                          value={formData.lovemeterSubtitle || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-805 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-550 transition shadow-xs font-sans"
                          placeholder="Drag the slider to test..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-500">100% Overflow Success Message</label>
                      <input
                        type="text"
                        name="lovemeterSuccessMessage"
                        value={formData.lovemeterSuccessMessage || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs"
                        placeholder="Overflowing with Love! 🌹✨"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-200/60 space-y-3 font-sans">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">Love Meter Slider Labels (From 0% to 100%)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4, 5].map(idx => (
                          <div key={idx} className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider">Label {idx + 1}</label>
                            <input
                              type="text"
                              value={
                                formData.lovemeterLabels?.[idx] ?? 
                                ['A Little', 'Pretty Much', 'A Lot', 'So Much', 'To the Moon & Back', 'Still Not Enough ∞'][idx]
                              }
                              onChange={e => {
                                const current = [...(formData.lovemeterLabels || ['A Little', 'Pretty Much', 'A Lot', 'So Much', 'To the Moon & Back', 'Still Not Enough ∞'])];
                                current[idx] = e.target.value;
                                setFormData({ ...formData, lovemeterLabels: current });
                              }}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* 18. Virtual Kiss Customizer */}
                <Section title="Virtual Kiss Customizer" icon={<Sparkles size={20} />} subtitle="Configure text elements of the virtual kiss shower button.">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans font-sans">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Eyebrow Tag</label>
                        <input
                          type="text"
                          name="kissEyebrow"
                          value={formData.kissEyebrow || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="Just Because"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Section Title</label>
                        <input
                          type="text"
                          name="kissTitle"
                          value={formData.kissTitle || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs"
                          placeholder="Send a Kiss"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Section Subtitle</label>
                        <input
                          type="text"
                          name="kissSubtitle"
                          value={formData.kissSubtitle || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-850 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-550 transition shadow-xs"
                          placeholder="Tap the giant kiss..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Button text label</label>
                        <input
                          type="text"
                          name="kissButtonText"
                          value={formData.kissButtonText || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs"
                          placeholder="Send A Kiss 💋"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500 font-sans font-sans">Success message content</label>
                        <input
                          type="text"
                          name="kissSuccessMessage"
                          value={formData.kissSuccessMessage || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="A kiss has been delivered 💋"
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                {/* 19. Anniversary Cake Wish Customizer */}
                <Section title="Wish Cake Customizer" icon={<Sparkles size={20} />} subtitle="Configure the wish cake, number of years, candles, and unlocked wishes.">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-sans font-sans font-sans">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Eyebrow Tag</label>
                        <input
                          type="text"
                          name="cakeEyebrow"
                          value={formData.cakeEyebrow || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="One Year of Magic"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-1">
                        <label className="block text-xs font-semibold text-slate-550 font-sans font-sans">Cake Title</label>
                        <input
                          type="text"
                          name="cakeTitle"
                          value={formData.cakeTitle || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="Make a Wish"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-1">
                        <label className="block text-xs font-semibold text-slate-550">Cake Year Number</label>
                        <input
                          type="number"
                          name="cakeYears"
                          value={formData.cakeYears ?? 1}
                          onChange={e => setFormData({ ...formData, cakeYears: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Blow Candle instructions message</label>
                        <input
                          type="text"
                          name="cakeBlowMessage"
                          value={formData.cakeBlowMessage || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-850 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="Tap each glowing candle to blow it out together 🎂"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Cake Success Message</label>
                        <input
                          type="text"
                          name="cakeSuccessMessage"
                          value={formData.cakeSuccessMessage || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-850 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="Your wish is sealed in our hearts! ✨"
                        />
                      </div>
                    </div>

                    <div className="p-5 bg-rose-50/20 border border-rose-100 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-rose-800 tracking-wider">🎁 WISH REVEALED DETAILS</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 font-sans">
                          <label className="block text-xs font-semibold text-slate-500">Wish Title Headline</label>
                          <input
                            type="text"
                            name="cakeRevealedMessage"
                            value={formData.cakeRevealedMessage || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs"
                            placeholder="Here's to another year of us."
                          />
                        </div>
                        <div className="space-y-1 font-sans font-sans">
                          <label className="block text-xs font-semibold text-slate-500">Wish Subtitle Headline</label>
                          <input
                            type="text"
                            name="cakeRevealedSubtitle"
                            value={formData.cakeRevealedSubtitle || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                            placeholder="May every year be sweeter than the last. 🎂✨"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* 20. Forever Section Customizer */}
                <Section title="Forever Section Customizer" icon={<Sparkles size={20} />} subtitle="Configure the final concluding section lines.">
                  <div className="space-y-4 font-sans font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Forever Section Line 1</label>
                        <input
                          type="text"
                          name="foreverLine1"
                          value={formData.foreverLine1 || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="365 days down."
                        />
                      </div>
                      <div className="space-y-1 font-sans">
                        <label className="block text-xs font-semibold text-slate-500">Forever Section Line 2</label>
                        <input
                          type="text"
                          name="foreverLine2"
                          value={formData.foreverLine2 || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-50 transition shadow-xs font-sans"
                          placeholder="Forever to go."
                        />
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )}

          {/* Bottom Save Button */}
          <div className="mt-12 pt-8 border-t border-slate-200/60">
            {shareLink ? (
              <div className="p-6 bg-emerald-50/50 rounded-xl text-center border border-emerald-200/60 shadow-xs">
                <p className="text-emerald-800 font-bold mb-4 text-lg font-sans">🎉 Your Custom Link is Ready!</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href={shareLink} target="_blank" className="text-rose-600 hover:text-rose-755 underline text-base font-semibold break-all" rel="noreferrer">{shareLink}</a>
                  <button 
                    onClick={() => copyToClipboard(shareLink)} 
                    className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 transition font-bold text-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-4">Anyone with this link will see your customized version of the site!</p>
              </div>
            ) : (
              <button 
                onClick={saveConfig} 
                disabled={saving || !!uploadingSlot}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white text-base font-bold transition shadow-md hover:bg-rose-700 cursor-pointer disabled:opacity-50 disabled:bg-slate-300 bg-rose-600"
              >
                {saving ? <Loader2 className="animate-spin text-white" /> : <Save size={18} />}
                {saving ? 'Generating Link...' : 'Save & Generate Shareable Link'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>

      {/* Floating Sticky Save Bar at the Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-40 flex items-center justify-between max-w-4xl mx-auto rounded-t-2xl font-sans">
        <div className="text-sm font-medium">
          {uploadingSlot ? (
            <span className="flex items-center gap-2 text-rose-600">
              <Loader2 className="animate-spin" size={16} />
              {uploadStatusMsg || 'Uploading image...'}
            </span>
          ) : shareLink ? (
            <span className="flex items-center gap-2 text-emerald-600">
              <Check size={16} />
              Custom Link Ready!
            </span>
          ) : (
            <span className="text-slate-500 text-xs sm:text-sm font-sans">
              Ready to generate your custom celebration link
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {shareLink ? (
            <>
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied Link' : 'Copy Link'}
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <ExternalLink size={14} />
                Open
              </a>
            </>
          ) : (
            <button
              onClick={saveConfig}
              disabled={saving || !!uploadingSlot}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50 disabled:bg-slate-300"
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              {saving ? 'Generating...' : 'Save & Generate Link'}
            </button>
          )}
        </div>
      </div>

      {/* Success Modal Popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Sparkles size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-800 font-sans">
              Your Custom Link is Ready!
            </h2>
            <p className="text-xs text-slate-500 mb-6 font-sans">
              All your dates, map locations, constellation stars, and photos have been saved. Share this unique link with your partner!
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-xs text-slate-600 break-all select-all mb-6">
              {shareLink}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Link'}
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-6 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink size={16} />
                Open Site
              </a>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 text-xs text-slate-400 hover:text-rose-600 underline cursor-pointer font-sans"
            >
              Close this window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
