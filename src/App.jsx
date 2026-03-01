import React, { useState, useEffect } from 'react';
// Firebase Imports
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase'; // এইমাত্র যে ফাইলটি বানালে

// ================= ICONS (Inline SVGs) =================
const DollarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const CartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>);
const UserPlaceholderIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);

// ================= DYNAMIC IMAGE IMPORTS =================
const getImageUrl = (filename) => {
  try { return new URL(`../${filename}`, import.meta.url).href; } 
  catch (error) { return null; }
};

// ================= DATA =================
const MEMBERS = [
  { id: 'm1', name: "শায়েখ সাহাব উদ্দিন", img: getImageUrl("সাহাব উদ্দিন.jpeg"), phone: "16892532453" },
  { id: 'm2', name: "হাফেজ মহসিন", img: getImageUrl("মহসিন.jpeg"), phone: "15165858019" },
  { id: 'm3', name: "মাওলানা রায়হান", img: getImageUrl("রায়হান মির্জা.jpeg"), phone: "19294939307" },
  { id: 'm4', name: "মাওলানা আবদুল সাত্তার", img: getImageUrl("আবদুল সাত্তার.jpeg"), phone: "19294754697" },
  { id: 'm5', name: "আলহাজ্ব বাপ্পি মোল্লা", img: getImageUrl("বাদশা.jpeg"), phone: "12137609654" },
  { id: 'm6', name: "মাওলানা ইমরান", img: getImageUrl("ইমরান ভুঁইয়া.png"), phone: "13479571836" }
];

const memberNamesOnly = MEMBERS.map(m => m.name);

// ================= FIXED EXPENSES (বাধ্যতামূলক খরচ) =================
const FIXED_EXPENSES = { rent: 483.33, electricity: 30, wifi: 14 };

// ================= HELPER FUNCTIONS =================
const startDate = new Date(2026, 1, 22);
const getCookIndex = (date) => {
  const d1 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return (((Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))) % 6) + 6) % 6; 
};
const getCleanerIndex = (date) => {
  const d = date.getDate();
  if (d >= 1 && d <= 5) return 2; if (d >= 6 && d <= 10) return 5;
  if (d >= 11 && d <= 15) return 1; if (d >= 16 && d <= 20) return 3;
  if (d >= 21 && d <= 25) return 4; return 0;
};
const convertToBanglaNumber = (number) => {
  const banglaNumbers = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return number.toFixed(2).replace(/[0-9]/g, x => banglaNumbers[x]);
};

// ================= MAIN APP COMPONENT =================
export default function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const [today, setToday] = useState(new Date());

  // Firebase State
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newItemText, setNewItemText] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editItemText, setEditItemText] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editBuyer, setEditBuyer] = useState('');

  useEffect(() => { setToday(new Date()); }, []);

  // Firebase Real-time Listener (onSnapshot)
  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setMarketItems(items);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Firebase: Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !newAmount) return;
    try {
      await addDoc(collection(db, "expenses"), {
        item: newItemText.trim(),
        amount: Number(newAmount),
        buyer: selectedBuyer,
        timestamp: new Date().getTime() // For sorting
      });
      setNewItemText(''); setNewAmount('');
    } catch (error) { console.error("Error adding document: ", error); }
  };

  // Firebase: Delete Expense
  const handleDeleteExpense = async (id) => {
    if (window.confirm("আপনি কি নিশ্চিত এই খরচটি মুছে ফেলতে চান?")) {
      try { await deleteDoc(doc(db, "expenses", id)); } 
      catch (error) { console.error("Error deleting document: ", error); }
    }
  };

  // Set Edit Mode
  const handleEditExpense = (item) => {
    setEditingId(item.id); setEditItemText(item.item);
    setEditAmount(item.amount.toString()); setEditBuyer(item.buyer);
  };

  // Firebase: Update Expense
  const handleSaveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "expenses", id), {
        item: editItemText,
        amount: Number(editAmount),
        buyer: editBuyer
      });
      setEditingId(null);
    } catch (error) { console.error("Error updating document: ", error); }
  };

  const handleCancelEdit = () => setEditingId(null);

  // ================= CALCULATION LOGIC =================
  const totalMarketExpense = marketItems.reduce((sum, item) => sum + item.amount, 0);
  const memberSpending = {};
  memberNamesOnly.forEach(name => { memberSpending[name] = 0; });
  marketItems.forEach(item => { if(memberSpending[item.buyer] !== undefined) memberSpending[item.buyer] += item.amount; });

  const totalMembers = MEMBERS.length;
  const totalRent = FIXED_EXPENSES.rent * totalMembers;
  const totalElectricity = FIXED_EXPENSES.electricity * totalMembers;
  const totalWifi = FIXED_EXPENSES.wifi * (totalMembers - 1);
  const grandTotal = totalMarketExpense + totalRent + totalElectricity + totalWifi;
  const perPersonMarket = totalMarketExpense / totalMembers;

  const perPersonTotal = {};
  memberNamesOnly.forEach(name => {
    let total = perPersonMarket + FIXED_EXPENSES.rent + FIXED_EXPENSES.electricity;
    if (name !== "মাওলানা আবদুল সাত্তার") total += FIXED_EXPENSES.wifi;
    perPersonTotal[name] = total;
  });

  const balances = {};
  memberNamesOnly.forEach(name => { balances[name] = memberSpending[name] - perPersonTotal[name]; });

  // ================= IMAGE FALLBACK COMPONENT =================
  const MemberAvatar = ({ src, alt, sizeClass = "w-12 h-12" }) => {
    const [imgError, setImgError] = useState(false);
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-slate-100 shrink-0`}>
        {!imgError && src ? <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setImgError(true)} /> : <UserPlaceholderIcon />}
      </div>
    );
  };

  // ================= RENDER HOME =================
  const renderHome = () => (
    <div className="flex flex-col h-full bg-[#f4f1f8]">
      <div className="bg-[#1e3a8a] text-center py-5 shadow-md z-10">
        <h1 className="text-yellow-400 text-3xl font-black mb-1 tracking-wider">লিল্লাহি এতিমখানা</h1>
        <h2 className="text-white text-xl font-bold">دار أيتام ليلاه</h2>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => setActiveTab('cook')} className="bg-[#ebdff0]/50 hover:bg-[#e9d5f3] transition p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-3 shadow-sm"><div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center shadow-inner"><DollarIcon /></div><p className="font-extrabold text-[#1e1b4b] text-sm">রান্নার সময়সূচি</p></button>
          <button onClick={() => setActiveTab('clean')} className="bg-[#ebdff0]/50 hover:bg-[#e9d5f3] transition p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-3 shadow-sm"><div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center shadow-inner"><ClockIcon /></div><p className="font-extrabold text-[#1e1b4b] text-sm">বাসা পরিষ্কার</p></button>
          <button onClick={() => setActiveTab('members')} className="bg-[#ebdff0]/50 hover:bg-[#e9d5f3] transition p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-3 shadow-sm"><div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shadow-inner"><UsersIcon /></div><p className="font-extrabold text-[#1e1b4b] text-sm">শায়েখ বৃন্দ</p></button>
          <button onClick={() => setActiveTab('accounts')} className="bg-[#ebdff0]/50 hover:bg-[#e9d5f3] transition p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-3 shadow-sm"><div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shadow-inner"><CartIcon /></div><p className="font-extrabold text-[#1e1b4b] text-sm">আয়-ব্যয়ের হিসাব</p></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl py-3 px-2 text-center shadow-sm border border-red-100 flex flex-col items-center"><MemberAvatar src={MEMBERS[getCookIndex(today)]?.img} alt="Cook" sizeClass="w-10 h-10 mb-2" /><p className="text-red-500 font-semibold text-[11px] mb-0.5 uppercase tracking-wide">আজকের শেফ</p><p className="text-red-700 font-bold text-sm leading-tight">{memberNamesOnly[getCookIndex(today)]}</p></div>
          <div className="bg-white rounded-xl py-3 px-2 text-center shadow-sm border border-pink-100 flex flex-col items-center"><MemberAvatar src={MEMBERS[getCleanerIndex(today)]?.img} alt="Cleaner" sizeClass="w-10 h-10 mb-2" /><p className="text-pink-400 font-semibold text-[11px] mb-0.5 uppercase tracking-wide">আজকের ক্লিনার</p><p className="text-pink-600 font-bold text-sm leading-tight">{memberNamesOnly[getCleanerIndex(today)]}</p></div>
        </div>
      </div>
      <div className="bg-[#0b216b] p-4 text-white pb-safe mt-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1e3a8a] rounded-xl py-4 text-center border border-blue-800 shadow-inner"><p className="text-lg font-bold mb-1 text-blue-100">বাজারের হিসাব</p><p className="text-red-400 text-2xl font-black">${convertToBanglaNumber(totalMarketExpense)}</p></div>
          <div className="bg-[#1e3a8a] rounded-xl py-4 text-center border border-blue-800 shadow-inner"><p className="text-lg font-bold mb-1 text-blue-100">মোট খরচ</p><p className="text-red-400 text-2xl font-black">${convertToBanglaNumber(grandTotal)}</p></div>
        </div>
      </div>
    </div>
  );

  // ================= SUB-PAGES =================
  const renderHeader = (title) => (
    <div className="bg-[#1e3a8a] text-white p-4 flex items-center gap-4 shadow-md sticky top-0 z-10">
      <button onClick={() => setActiveTab('home')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );

  const renderAccounts = () => (
    <div className="h-full flex flex-col bg-slate-50">
      {renderHeader("আয়-ব্যয়ের হিসাব")}
      <div className="p-4 space-y-4 overflow-y-auto pb-24">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl shadow-lg text-white">
          <h3 className="text-lg font-bold mb-3 border-b border-white/30 pb-2">সম্পূর্ণ হিসাব</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-blue-200 text-xs mb-1">বাজার খরচ</p><p className="font-black text-lg">${convertToBanglaNumber(totalMarketExpense)}</p></div>
            <div><p className="text-blue-200 text-xs mb-1">বাসা ভাড়া</p><p className="font-black text-lg">${convertToBanglaNumber(totalRent)}</p></div>
            <div><p className="text-blue-200 text-xs mb-1">বিদ্যুৎ বিল</p><p className="font-black text-lg">${convertToBanglaNumber(totalElectricity)}</p></div>
            <div><p className="text-blue-200 text-xs mb-1">ওয়াইফাই বিল</p><p className="font-black text-lg">${convertToBanglaNumber(totalWifi)}</p></div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/30"><p className="text-yellow-300 text-sm mb-1">মোট খরচ</p><p className="font-black text-3xl text-yellow-400">${convertToBanglaNumber(grandTotal)}</p></div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-3 text-slate-800 border-b pb-2">প্রত্যেকের হিসাব</h3>
          <div className="space-y-2">
            {memberNamesOnly.map((name) => {
              const spent = memberSpending[name]; const shouldPay = perPersonTotal[name]; const balance = balances[name];
              return (
                <div key={name} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800 mb-2">{name}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-slate-500">খরচ করেছেন</p><p className="font-bold text-blue-600">${convertToBanglaNumber(spent)}</p></div>
                    <div><p className="text-slate-500">দিতে হবে</p><p className="font-bold text-orange-600">${convertToBanglaNumber(shouldPay)}</p></div>
                    <div>
                      {balance > 0 && <p className="text-green-600 font-semibold">পাওনা</p>}
                      {balance < 0 && <p className="text-red-600 font-semibold">দেনা</p>}
                      {balance === 0 && <p className="text-slate-500 font-semibold">সমান</p>}
                      <p className={`font-black text-sm ${balance > 0 ? 'text-green-700' : balance < 0 ? 'text-red-700' : 'text-slate-600'}`}>${convertToBanglaNumber(Math.abs(balance))}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-3 text-slate-800">নতুন খরচ যুক্ত করুন</h3>
          <form onSubmit={handleAddExpense} className="space-y-3">
            <input type="text" placeholder="পণ্যের নাম" className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-blue-500" value={newItemText} onChange={(e)=>setNewItemText(e.target.value)} required />
            <div className="flex gap-2">
              <input type="number" step="0.01" placeholder="পরিমাণ ($)" className="w-1/3 bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-blue-500" value={newAmount} onChange={(e)=>setNewAmount(e.target.value)} required />
              <select className="flex-1 bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-blue-500" value={selectedBuyer} onChange={(e)=>setSelectedBuyer(e.target.value)}>{memberNamesOnly.map(name => <option key={name} value={name}>{name}</option>)}</select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">যুক্ত করুন</button>
          </form>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800 mb-2">বাজার লিস্ট</h3>
          {loading ? <p className="text-center text-slate-500 py-4">লোড হচ্ছে...</p> : marketItems.length === 0 ? <p className="text-center text-slate-400 py-4">এখনও কোনো খরচ যুক্ত করা হয়নি</p> : 
          marketItems.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm">
              {editingId === item.id ? (
                <div className="flex-1 space-y-2">
                  <input type="text" className="w-full bg-slate-50 border p-2 rounded-lg text-sm" value={editItemText} onChange={(e) => setEditItemText(e.target.value)} />
                  <div className="flex gap-2">
                    <input type="number" step="0.01" className="w-1/3 bg-slate-50 border p-2 rounded-lg text-sm" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
                    <select className="flex-1 bg-slate-50 border p-2 rounded-lg text-sm" value={editBuyer} onChange={(e) => setEditBuyer(e.target.value)}>{memberNamesOnly.map(name => <option key={name} value={name}>{name}</option>)}</select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(item.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold">সেভ করুন</button>
                    <button onClick={handleCancelEdit} className="flex-1 bg-slate-400 text-white py-2 rounded-lg text-sm font-bold">বাতিল</button>
                  </div>
                </div>
              ) : (
                <><div className="flex-1"><p className="font-bold text-slate-800">{item.item}</p><p className="text-xs text-blue-600 font-semibold">{item.buyer}</p></div><div className="flex items-center gap-3"><span className="font-black text-red-500">${convertToBanglaNumber(item.amount)}</span><button onClick={() => handleEditExpense(item)} className="text-blue-500 p-1"><EditIcon /></button><button onClick={() => handleDeleteExpense(item.id)} className="text-slate-400 hover:text-red-500 p-1"><TrashIcon /></button></div></>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSchedule = (type) => {
    const isCook = type === 'cook';
    const scheduleData = MEMBERS.map((m) => ({ ...m, isToday: isCook ? memberNamesOnly[getCookIndex(today)] === m.name : memberNamesOnly[getCleanerIndex(today)] === m.name }));
    return (
      <div className="h-full flex flex-col bg-slate-50">{renderHeader(isCook ? "রান্নার সময়সূচি" : "পরিষ্কারের সময়সূচি")}<div className="p-4 space-y-3">{scheduleData.map((d, i) => (<div key={i} className={`p-3 rounded-xl flex items-center gap-4 border shadow-sm ${d.isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}><MemberAvatar src={d.img} alt={d.name} sizeClass="w-12 h-12" /><div className="flex-1"><p className={`font-bold ${d.isToday ? 'text-blue-800 text-lg' : 'text-slate-700'}`}>{d.name}</p>{d.isToday && <p className="text-blue-600 text-xs font-bold mt-0.5">আজকের দায়িত্ব</p>}</div></div>))}</div></div>
    );
  };

  const renderMembers = () => (
    <div className="h-full flex flex-col bg-slate-50">{renderHeader("শায়েখ বৃন্দ")}<div className="p-4 grid gap-3">{MEMBERS.map((m, i) => (<div key={i} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm"><div className="flex items-center gap-3"><MemberAvatar src={m.img} alt={m.name} sizeClass="w-12 h-12" /><span className="font-bold text-slate-800 text-lg">{m.name}</span></div><a href={`tel:${m.phone}`} className="bg-green-100 text-green-700 p-3 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a></div>))}</div></div>
  );

  return (
    <div className="min-h-screen bg-slate-200 flex justify-center items-center"><div className="w-full max-w-[400px] h-[100dvh] sm:h-[850px] bg-white sm:rounded-[3rem] sm:shadow-2xl overflow-hidden relative border-8 border-transparent">{activeTab === 'home' && renderHome()}{activeTab === 'cook' && renderSchedule('cook')}{activeTab === 'clean' && renderSchedule('clean')}{activeTab === 'members' && renderMembers()}{activeTab === 'accounts' && renderAccounts()}</div></div>
  );
}
