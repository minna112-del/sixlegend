import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// ================= CONFIG =================
const APP_PIN = "1126";
const PIN_STORAGE_KEY = "lillahi_pin_ok_v1";

// WhatsApp group invite link
const WHATSAPP_GROUP_INVITE_URL = "https://chat.whatsapp.com/C8dEbHfrmKfERqSGDxreuK";

// বাধ্যতামূলক খরচ (জনপ্রতি)
const FIXED_EXPENSES = { rent: 483.33, electricity: 30, wifi: 14 };
const WIFI_EXEMPT_NAME = "মাওলানা আবদুল সাত্তার";

// ================= ICONS (Inline SVGs) =================
const DollarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const CartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>);
const UserPlaceholderIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);

// ================= IMAGES =================
const getImageUrl = (filename) => {
  try { return new URL(`../${filename}`, import.meta.url).href; } 
  catch { return null; }
};

// ================= MEMBERS =================
const MEMBERS = [
  { id: "m1", name: "শায়েখ সাহাব উদ্দিন", img: getImageUrl("সাহাব উদ্দিন.jpeg"), phone: "16892532453" },
  { id: "m2", name: "হাফেজ মহসিন", img: getImageUrl("মহসিন.jpeg"), phone: "15165858019" },
  { id: "m3", name: "মাওলানা রায়হান", img: getImageUrl("রায়হান মির্জা.jpeg"), phone: "19294939307" },
  { id: "m4", name: "মাওলানা আবদুল সাত্তার", img: getImageUrl("আবদুল সাত্তার.jpeg"), phone: "19294754697" },
  { id: "m5", name: "আলহাজ্ব বাপ্পি মোল্লা", img: getImageUrl("বাদশা.jpeg"), phone: "12137609654" },
  { id: "m6", name: "মাওলানা ইমরান", img: getImageUrl("ইমরান ভুঁইয়া.png"), phone: "13479571836" },
];
const memberNamesOnly = MEMBERS.map((m) => m.name);

// ================= HELPERS =================
const startDate = new Date(2026, 1, 22);

const getCookIndex = (date) => {
  const d1 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  return ((diffDays % 6) + 6) % 6;
};

const getCleanerIndex = (date) => {
  const d = date.getDate();
  if (d >= 1 && d <= 5) return 2; if (d >= 6 && d <= 10) return 5;
  if (d >= 11 && d <= 15) return 1; if (d >= 16 && d <= 20) return 3;
  if (d >= 21 && d <= 25) return 4; return 0;
};

const convertToBanglaNumber = (number) => {
  const banglaNumbers = { 0: "০", 1: "১", 2: "২", 3: "৩", 4: "৪", 5: "৫", 6: "৬", 7: "৭", 8: "৮", 9: "৯" };
  return Number(number || 0).toFixed(2).replace(/[0-9]/g, (x) => banglaNumbers[x]);
};

const pad2 = (n) => String(n).padStart(2, "0");
const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

// Date Format to YYYY-MM-DD for input field
const formatDateForInput = (dateTimestamp) => {
  const d = new Date(dateTimestamp);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const monthLabelBn = (monthKey) => {
  const [y, m] = monthKey.split("-").map(Number);
  const names = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  return `${names[m - 1]} ${y}`;
};

const buildMonthOptions = (count = 18) => {
  const options = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < count; i++) {
    options.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`);
    d.setMonth(d.getMonth() - 1);
  }
  return options;
};

const makeWhatsAppShareUrl = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

// ================= APP =================
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [today, setToday] = useState(new Date());

  // Lock
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem(PIN_STORAGE_KEY) === "1");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Month filter
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const monthOptions = useMemo(() => buildMonthOptions(24), []);

  // Firestore data
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [newItemText, setNewItemText] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(Date.now())); // নতুন ফিল্ড (Date)

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editItemText, setEditItemText] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editBuyer, setEditBuyer] = useState("");
  const [editDate, setEditDate] = useState(""); // এডিটের জন্য Date

  // WhatsApp share modal
  const [shareOpen, setShareOpen] = useState(false);
  const [shareText, setShareText] = useState("");

  useEffect(() => { setToday(new Date()); }, []);

  // Firestore monthly listener
  useEffect(() => {
    setLoading(true);
    const [yy, mm] = monthKey.split("-").map(Number);
    const start = new Date(yy, mm - 1, 1).getTime();
    const end = new Date(yy, mm, 1).getTime();

    const q = query(
      collection(db, "expenses"),
      where("timestamp", ">=", start),
      where("timestamp", "<", end),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setMarketItems(items);
      setLoading(false);
    });

    return () => unsub();
  }, [monthKey]);

  const unlock = () => {
    if (pinInput.trim() === APP_PIN) {
      localStorage.setItem(PIN_STORAGE_KEY, "1");
      setIsUnlocked(true); setPinError(""); setPinInput("");
    } else { setPinError("ভুল কোড। আবার চেষ্টা করুন।"); }
  };

  const logout = () => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    setIsUnlocked(false); setActiveTab("home");
  };

  // Firebase CRUD
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !newAmount || !selectedDate) return;

    // Convert selected input date to timestamp (add current hour/min to avoid timezone offset issue)
    const inputDate = new Date(selectedDate);
    const now = new Date();
    inputDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    const ts = inputDate.getTime();

    const payload = {
      item: newItemText.trim(),
      amount: Number(newAmount),
      buyer: selectedBuyer,
      timestamp: ts,
    };

    await addDoc(collection(db, "expenses"), payload);

    // WhatsApp share prompt
    const msg = `বাজার যোগ হয়েছে (${monthLabelBn(monthKey)})\nপণ্য: ${payload.item}\nদাম: $${Number(payload.amount).toFixed(2)}\nতারিখ: ${new Date(ts).toLocaleDateString("bn-BD")}\nকিনেছেন: ${payload.buyer}\nলিংক: ${window.location.origin}`;
    setShareText(msg); setShareOpen(true);

    setNewItemText(""); setNewAmount(""); 
    // Do not clear Date so they can add multiple items on same past date easily
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("আপনি কি নিশ্চিত এই খরচটি মুছে ফেলতে চান?")) {
      await deleteDoc(doc(db, "expenses", id));
    }
  };

  const handleEditExpense = (item) => {
    setEditingId(item.id);
    setEditItemText(item.item || "");
    setEditAmount(String(item.amount ?? ""));
    setEditBuyer(item.buyer || memberNamesOnly[0]);
    setEditDate(formatDateForInput(item.timestamp)); // Load current date in input format
  };

  const handleSaveEdit = async (id) => {
    // Convert edit date to timestamp
    const inputDate = new Date(editDate);
    const ts = inputDate.getTime();

    await updateDoc(doc(db, "expenses", id), {
      item: editItemText,
      amount: Number(editAmount),
      buyer: editBuyer,
      timestamp: ts, // Update timestamp
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => setEditingId(null);

  // Calculations (month ভিত্তিক)
  const totalMarketExpense = marketItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const memberSpending = {};
  memberNamesOnly.forEach((name) => (memberSpending[name] = 0));
  marketItems.forEach((item) => {
    if (memberSpending[item.buyer] !== undefined) memberSpending[item.buyer] += Number(item.amount || 0);
  });

  const totalMembers = MEMBERS.length;
  const totalRent = FIXED_EXPENSES.rent * totalMembers;
  const totalElectricity = FIXED_EXPENSES.electricity * totalMembers;
  const totalWifi = FIXED_EXPENSES.wifi * (totalMembers - 1);
  const grandTotal = totalMarketExpense + totalRent + totalElectricity + totalWifi;

  const perPersonMarket = totalMembers ? totalMarketExpense / totalMembers : 0;

  const perPersonTotal = {};
  memberNamesOnly.forEach((name) => {
    let total = perPersonMarket + FIXED_EXPENSES.rent + FIXED_EXPENSES.electricity;
    if (name !== WIFI_EXEMPT_NAME) total += FIXED_EXPENSES.wifi;
    perPersonTotal[name] = total;
  });

  const balances = {};
  memberNamesOnly.forEach((name) => {
    balances[name] = memberSpending[name] - perPersonTotal[name]; 
  });

  // Avatar
  const MemberAvatar = ({ src, alt, sizeClass = "w-12 h-12" }) => {
    const [imgError, setImgError] = useState(false);
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-slate-100 shrink-0`}>
        {!imgError && src ? <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setImgError(true)} /> : <UserPlaceholderIcon />}
      </div>
    );
  };

  // Lock screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-200 flex justify-center items-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-[#1e3a8a] text-center py-6 px-4"><h1 className="text-yellow-400 text-3xl font-black mb-1 tracking-wider">লিল্লাহি এতিমখানা</h1><p className="text-white/90 font-bold">প্রবেশ কোড দিন</p></div>
          <div className="p-5 space-y-3">
            <input inputMode="numeric" type="password" maxLength={6} value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="কোড (1126)" className="w-full bg-slate-50 border p-4 rounded-2xl focus:outline-none focus:border-blue-500 text-center text-lg tracking-widest" />
            {pinError && <p className="text-red-600 text-sm font-semibold text-center">{pinError}</p>}
            <button onClick={unlock} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl">প্রবেশ করুন</button>
            <p className="text-xs text-slate-400 text-center">নোট: এটি অ্যাপ-লেভেল লক (সাধারণ সিকিউরিটি)।</p>
          </div>
        </div>
      </div>
    );
  }

  // Shared header
  const renderHeader = (title) => (
    <div className="bg-[#1e3a8a] text-white p-4 flex items-center gap-3 shadow-md sticky top-0 z-10">
      <button onClick={() => setActiveTab("home")} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg></button>
      <h2 className="text-xl font-bold flex-1">{title}</h2>
      <button onClick={logout} className="bg-white/15 px-3 py-2 rounded-xl text-xs font-bold">Logout</button>
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col h-full bg-[#f4f1f8]">
      <div className="bg-[#1e3a8a] text-center py-5 shadow-md z-10"><h1 className="text-yellow-400 text-3xl font-black mb-1 tracking-wider">লিল্লাহি এতিমখানা</h1><h2 className="text-white text-xl font-bold">دار أيتام ليلاه</h2></div>
      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => setActiveTab("cook")} className="bg-[#ebdff0]/50 hover:bg-[#e9d5f3] transition p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-3 shadow-sm"><div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center shadow-inner"><DollarIcon /></div><p className="font-extrabold text-[#1e1b4b] text-sm">রান্নার সময়সূচি</p></button>
          <button onClick={() => setActiveTab("clean")} className="bg-[#ebdff0]/50 hover:bg-[#e9d5f3] transition p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-3 shadow-sm"><div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center shadow-inner"><ClockIcon /></div><p className="font-extrabold text-[#1e1b4b] text-sm">বাসা পরিষ্কার</p></button>
          <button onClick={() => setActiveTab("members")} className="bg-[#ebdff0]/50 hover:bg-[#e9d5f3] transition p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-3 shadow-sm"><div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shadow-inner"><UsersIcon /></div><p className="font-extrabold text-[#1e1b4b] text-sm">শায়েখ বৃন্দ</p></button>
          <button onClick={() => setActiveTab("accounts")} className="bg-[#ebdff0]/50 hover:bg-[#e9d5f3] transition p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-3 shadow-sm"><div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shadow-inner"><CartIcon /></div><p className="font-extrabold text-[#1e1b4b] text-sm">আয়-ব্যয়ের হিসাব</p></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl py-3 px-2 text-center shadow-sm border border-red-100 flex flex-col items-center"><MemberAvatar src={MEMBERS[getCookIndex(today)]?.img} alt="Cook" sizeClass="w-10 h-10 mb-2" /><p className="text-red-500 font-semibold text-[11px] mb-0.5 uppercase tracking-wide">আজকের শেফ</p><p className="text-red-700 font-bold text-sm leading-tight">{memberNamesOnly[getCookIndex(today)]}</p></div>
          <div className="bg-white rounded-xl py-3 px-2 text-center shadow-sm border border-pink-100 flex flex-col items-center"><MemberAvatar src={MEMBERS[getCleanerIndex(today)]?.img} alt="Cleaner" sizeClass="w-10 h-10 mb-2" /><p className="text-pink-400 font-semibold text-[11px] mb-0.5 uppercase tracking-wide">আজকের ক্লিনার</p><p className="text-pink-600 font-bold text-sm leading-tight">{memberNamesOnly[getCleanerIndex(today)]}</p></div>
        </div>
      </div>
      <div className="bg-[#0b216b] p-4 text-white pb-safe mt-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1e3a8a] rounded-xl py-4 text-center border border-blue-800 shadow-inner"><p className="text-lg font-bold mb-1 text-blue-100">বাজারের হিসাব</p><p className="text-red-400 text-2xl font-black">${convertToBanglaNumber(totalMarketExpense)}</p><p className="text-[11px] text-blue-200 mt-1">{monthLabelBn(monthKey)}</p></div>
          <div className="bg-[#1e3a8a] rounded-xl py-4 text-center border border-blue-800 shadow-inner"><p className="text-lg font-bold mb-1 text-blue-100">মোট খরচ</p><p className="text-red-400 text-2xl font-black">${convertToBanglaNumber(grandTotal)}</p><p className="text-[11px] text-blue-200 mt-1">{monthLabelBn(monthKey)}</p></div>
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="h-full flex flex-col bg-slate-50">
      {renderHeader("আয়-ব্যয়ের হিসাব")}
      <div className="p-4 space-y-4 overflow-y-auto pb-24">
        
        {/* Month selector */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-semibold mb-1">মাস নির্বাচন</p>
            <select value={monthKey} onChange={(e) => setMonthKey(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-blue-500">
              {monthOptions.map((k) => (<option key={k} value={k}>{monthLabelBn(k)}</option>))}
            </select>
          </div>
          {WHATSAPP_GROUP_INVITE_URL && (<a href={WHATSAPP_GROUP_INVITE_URL} target="_blank" rel="noreferrer" className="bg-green-600 text-white font-bold px-4 py-3 rounded-xl text-sm text-center">গ্রুপ<br/>খুলুন</a>)}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl shadow-lg text-white">
          <h3 className="text-lg font-bold mb-3 border-b border-white/30 pb-2">সম্পূর্ণ হিসাব ({monthLabelBn(monthKey)})</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-blue-200 text-xs mb-1">বাজার খরচ</p><p className="font-black text-lg">${convertToBanglaNumber(totalMarketExpense)}</p></div>
            <div><p className="text-blue-200 text-xs mb-1">বাসা ভাড়া</p><p className="font-black text-lg">${convertToBanglaNumber(totalRent)}</p></div>
            <div><p className="text-blue-200 text-xs mb-1">বিদ্যুৎ বিল</p><p className="font-black text-lg">${convertToBanglaNumber(totalElectricity)}</p></div>
            <div><p className="text-blue-200 text-xs mb-1">ওয়াইফাই বিল</p><p className="font-black text-lg">${convertToBanglaNumber(totalWifi)}</p></div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/30"><p className="text-yellow-300 text-sm mb-1">মোট খর
