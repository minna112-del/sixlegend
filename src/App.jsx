import React, { useState, useEffect } from 'react';

// ================= ICONS (Inline SVGs) =================
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const WhatsappIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

// ================= IMAGE IMPORTS =================
// যেহেতু ছবিগুলো src ফোল্ডারের বাইরে মেইন ফোল্ডারে আছে, তাই ../ ব্যবহার করা হয়েছে
import imgSahabUddin from '../সাহাব উদ্দিন.jpeg';
import imgMahsin from '../মহসিন.jpeg';
import imgRayhan from '../রায়হান মির্জা.jpeg';
import imgSattar from '../আবদুল সাত্তার.jpeg';
import imgBadsha from '../বাদশা.jpeg';
import imgImran from '../ইমরান ভুঁইয়া.png';

// ================= DATA =================
const MEMBERS = [
  { id: 'm1', name: "শায়েখ সাহাব উদ্দিন", img: imgSahabUddin, phone: "16892532453" },
  { id: 'm2', name: "হাফেজ মহসিন", img: imgMahsin, phone: "15165858019" },
  { id: 'm3', name: "মাওলানা রায়হান", img: imgRayhan, phone: "19294939307" },
  { id: 'm4', name: "মাওলানা আবদুল সাত্তার", img: imgSattar, phone: "19294754697" },
  { id: 'm5', name: "আলহাজ্ব বাপ্পি মোল্লা", img: imgBadsha, phone: "12137609654" },
  { id: 'm6', name: "মাওলানা ইমরান", img: imgImran, phone: "13479571836" }
];

const memberNamesOnly = MEMBERS.map(m => m.name);

// ================= HELPER FUNCTIONS =================
const startDate = new Date(2026, 1, 22); // 22 Feb 2026

const getCookIndex = (date) => {
  const d1 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = d2 - d1;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return ((diffDays % 6) + 6) % 6; 
};

const getCleanerIndex = (date) => {
  const d = date.getDate();
  if (d >= 1 && d <= 5) return 2;
  if (d >= 6 && d <= 10) return 5;
  if (d >= 11 && d <= 15) return 1;
  if (d >= 16 && d <= 20) return 3;
  if (d >= 21 && d <= 25) return 4;
  if (d >= 26) return 0;
  return 0;
};

const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

const convertToBanglaNumber = (number) => {
  const banglaNumbers = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return number.toString().replace(/[0-9]/g, x => banglaNumbers[x]);
};

// ================= REACT APP =================
export default function App() {
  const [today, setToday] = useState(new Date());

  // LocalStorage State for Market Items
  const [marketItems, setMarketItems] = useState(() => {
    const saved = localStorage.getItem('lillahi_market_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [newItemText, setNewItemText] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const whatsappLink = "https://chat.whatsapp.com/C8dEbHfrmKfERqSGDxreuK?mode=gi_t";

  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  // Save to LocalStorage whenever marketItems change
  useEffect(() => {
    localStorage.setItem('lillahi_market_items', JSON.stringify(marketItems));
  }, [marketItems]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !newAmount) return;
    
    const newItem = {
      id: Date.now().toString(),
      item: newItemText.trim(),
      amount: Number(newAmount),
      buyer: selectedBuyer,
      date: new Date().toISOString(),
      month: new Date().getMonth()
    };

    setMarketItems([newItem, ...marketItems]);
    setNewItemText(''); 
    setNewAmount('');
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("আপনি কি নিশ্চিত এই খরচটি মুছে ফেলতে চান?")) {
      setMarketItems(marketItems.filter(item => item.id !== id));
    }
  };

  const activeMonthItems = marketItems.filter(item => {
    const itemMonth = item.month !== undefined ? item.month : new Date(item.date).getMonth();
    return itemMonth === selectedMonth;
  });

  const totalExpense = activeMonthItems.reduce((sum, item) => sum + item.amount, 0);
  const perPersonCost = MEMBERS.length > 0 ? totalExpense / MEMBERS.length : 0;

  const spentByMember = MEMBERS.map(m => {
    const spent = activeMonthItems.filter(i => i.buyer === m.name).reduce((sum, i) => sum + i.amount, 0);
    return {
      name: m.name,
      spent: spent,
      balance: spent - perPersonCost
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white py-8 px-4 text-center shadow-lg rounded-b-3xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-wide mb-2 drop-shadow-md">লিল্লাহি এতিমখানা</h1>
        <p className="text-emerald-100 font-medium text-lg bg-black/20 inline-block px-4 py-1.5 rounded-full mt-2">
          {convertToBanglaNumber(today.getDate())} {monthNames[today.getMonth()]}, {convertToBanglaNumber(today.getFullYear())}
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-8">
        
        {/* Schedule Cards with Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200 shrink-0">
               <img 
                 src={MEMBERS[getCookIndex(today)]?.img} 
                 alt={MEMBERS[getCookIndex(today)]?.name} 
                 className="w-full h-full object-cover"
                 onError={(e) => { e.target.onerror = null; e.target.src = "image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23e2e8f0' viewBox='0 0 24 24'%3E%3Cpath d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' /%3E%3C/svg%3E"; }}
               />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold mb-1">আজকের রান্নার দায়িত্বে</p>
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">{memberNamesOnly[getCookIndex(today)]}</h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-teal-200 shrink-0">
               <img 
                 src={MEMBERS[getCleanerIndex(today)]?.img} 
                 alt={MEMBERS[getCleanerIndex(today)]?.name} 
                 className="w-full h-full object-cover"
                 onError={(e) => { e.target.onerror = null; e.target.src = "image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23e2e8f0' viewBox='0 0 24 24'%3E%3Cpath d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' /%3E%3C/svg%3E"; }}
               />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold mb-1">আজকের পরিষ্কারের দায়িত্বে</p>
              <h2 className="text-xl sm:text-2xl font-bold text-teal-900">{memberNamesOnly[getCleanerIndex(today)]}</h2>
            </div>
          </div>
        </div>

        {/* Input Form & List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Add Expense Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">নতুন বাজার যুক্ত করুন</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">কী বাজার করা হলো?</label>
                <input 
                  type="text" 
                  placeholder="যেমন: চাল, ডাল, মুরগি" 
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={newItemText} 
                  onChange={(e)=>setNewItemText(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">টাকার পরিমাণ</label>
                  <input 
                    type="number" 
                    placeholder="৳" 
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={newAmount} 
                    onChange={(e)=>setNewAmount(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">কে কিনেছে?</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    value={selectedBuyer} 
                    onChange={(e)=>setSelectedBuyer(e.target.value)}
                  >
                    {memberNamesOnly.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-2">
                হিসাবে যুক্ত করুন
              </button>
            </form>
          </div>

          {/* Expense List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h3 className="text-xl font-bold text-slate-800">বাজারের তালিকা</h3>
               <select 
                  className="bg-slate-100 border border-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx}>{m} মাস</option>
                  ))}
               </select>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {activeMonthItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-4xl mb-2">🛒</span>
                  <p>এই মাসে কোনো বাজারের হিসাব নেই</p>
                </div>
              ) : (
                activeMonthItems.map(item => (
                  <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex justify-between items-center group hover:border-emerald-200 transition-all">
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{item.item}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ক্রেতা: <span className="font-semibold text-emerald-700">{item.buyer}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-slate-700 text-lg">৳{convertToBanglaNumber(item.amount)}</span>
                      <button onClick={()=>handleDeleteExpense(item.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl">
          <h3 className="text-2xl font-black mb-6 text-emerald-400 border-b border-slate-700 pb-4">মাসের মোট হিসাব</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <p className="text-slate-400 text-sm font-medium mb-1">সর্বমোট খরচ</p>
              <p className="text-3xl md:text-4xl font-black">৳{convertToBanglaNumber(totalExpense)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <p className="text-slate-400 text-sm font-medium mb-1">জনপ্রতি খরচ ({MEMBERS.length} জন)</p>
              <p className="text-3xl md:text-4xl font-black text-emerald-400">৳{convertToBanglaNumber(Math.round(perPersonCost))}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spentByMember.map((m, idx) => {
               let balanceClass = 'bg-slate-800 border-slate-700';
               let textColor = 'text-slate-300';
               let label = 'হিসাব ক্লিয়ার';
               let amount = '';

               if (m.balance > 0) {
                   balanceClass = 'bg-emerald-900/30 border-emerald-800/50';
                   textColor = 'text-emerald-400';
                   label = 'পাবে';
                   amount = `৳${convertToBanglaNumber(Math.round(m.balance))}`;
               } else if (m.balance < 0) {
                   balanceClass = 'bg-red-900/30 border-red-800/50';
                   textColor = 'text-red-400';
                   label = 'দেবে';
                   amount = `৳${convertToBanglaNumber(Math.round(Math.abs(m.balance)))}`;
               }

              return (
                  <div key={idx} className={`rounded-xl p-4 border flex justify-between items-center ${balanceClass}`}>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-600 bg-slate-800 shrink-0">
                            <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-sm sm:text-base leading-tight">{m.name}</p>
                            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">মোট বাজার: ৳{convertToBanglaNumber(m.spent)}</p>
                          </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-0.5 ${
                            m.balance > 0 ? 'bg-emerald-500/20 text-emerald-300' : 
                            m.balance < 0 ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-400'
                          }`}>{label}</span>
                          <span className={`font-black text-lg sm:text-xl ${textColor}`}>{amount || '-'}</span>
                      </div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* Members & WhatsApp */}
        <div className="flex flex-col items-center mt-12 mb-6">
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <WhatsappIcon />
            অফিসিয়াল WhatsApp গ্রুপ
          </a>
        </div>
        
      </main>
    </div>
  );
}
