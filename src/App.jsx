import React, { useState, useEffect } from 'react';

// ================= ICONS (Inline SVGs) =================
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5 15H4a2 2 0 0 1-2-2V4"/><path d="M22 13v-2"/><path d="M22 17v-2"/></svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const WhatsappIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
);

// ================= IMAGE IMPORTS =================
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
const startDate = new Date(2026, 1, 22);

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

// ================= APP COMPONENT =================
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, schedule, accounts
  const [today, setToday] = useState(new Date());

  const [marketItems, setMarketItems] = useState(() => {
    const saved = localStorage.getItem('lillahi_market_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [newItemText, setNewItemText] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    setToday(new Date());
  }, []);

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

  // Calculations
  const activeMonthItems = marketItems.filter(item => {
    const itemMonth = item.month !== undefined ? item.month : new Date(item.date).getMonth();
    return itemMonth === selectedMonth;
  });

  const totalExpense = activeMonthItems.reduce((sum, item) => sum + item.amount, 0);
  const perPersonCost = MEMBERS.length > 0 ? totalExpense / MEMBERS.length : 0;

  const spentByMember = MEMBERS.map(m => {
    const spent = activeMonthItems.filter(i => i.buyer === m.name).reduce((sum, i) => sum + i.amount, 0);
    return { name: m.name, img: m.img, spent: spent, balance: spent - perPersonCost };
  });

  // ================= VIEW COMPONENTS =================
  
  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-semibold mb-1">{monthNames[selectedMonth]} মাসের মোট খরচ</p>
          <p className="text-3xl font-black text-slate-800">৳{convertToBanglaNumber(totalExpense)}</p>
        </div>
        <div className="bg-emerald-600 p-5 rounded-2xl shadow-md text-white flex flex-col justify-center">
          <p className="text-emerald-100 text-sm font-semibold mb-1">জনপ্রতি খরচ (৬ জন)</p>
          <p className="text-3xl font-black">৳{convertToBanglaNumber(Math.round(perPersonCost))}</p>
        </div>
      </div>

      {/* Today's Duty Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">আজকের দায়িত্ব</h3>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-medium">
            {convertToBanglaNumber(today.getDate())} {monthNames[today.getMonth()]}
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
               <img src={MEMBERS[getCookIndex(today)]?.img} alt="Cook" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">রান্না</p>
              <p className="font-bold text-slate-800">{memberNamesOnly[getCookIndex(today)]}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-teal-50 p-3 rounded-xl border border-teal-100">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
               <img src={MEMBERS[getCleanerIndex(today)]?.img} alt="Cleaner" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">পরিষ্কার</p>
              <p className="font-bold text-slate-800">{memberNamesOnly[getCleanerIndex(today)]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-700 mb-4">সদস্যদের হিসাবের অবস্থা</h3>
        <div className="space-y-3">
          {spentByMember.map((m, idx) => {
            const isOwe = m.balance < 0;
            const isReceive = m.balance > 0;
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <img src={m.img} alt={m.name} className="w-8 h-8 rounded-full border border-slate-300 object-cover" />
                  <p className="font-semibold text-slate-800 text-sm">{m.name}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
                    isReceive ? 'bg-emerald-100 text-emerald-700' : isOwe ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isReceive ? 'পাবে' : isOwe ? 'দেবে' : 'ক্লিয়ার'}
                  </span>
                  <span className={`font-black ${isReceive ? 'text-emerald-600' : isOwe ? 'text-red-600' : 'text-slate-500'}`}>
                    {isOwe || isReceive ? `৳${convertToBanglaNumber(Math.round(Math.abs(m.balance)))}` : '-'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">পূর্ণ শিডিউল</h2>
      {/* Cooking Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-orange-50 px-5 py-4 border-b border-orange-100 flex items-center gap-3">
          <span className="text-2xl">👨‍🍳</span>
          <h3 className="font-bold text-orange-900 text-lg">রান্নার সিরিয়াল</h3>
        </div>
        <div className="p-2">
          {MEMBERS.map((m, idx) => {
             // Calculate if this person is cooking today
             const isTodayCook = memberNamesOnly[getCookIndex(today)] === m.name;
             return (
              <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl mb-1 ${isTodayCook ? 'bg-orange-100 border border-orange-200' : ''}`}>
                <img src={m.img} alt={m.name} className={`w-10 h-10 rounded-full object-cover ${isTodayCook ? 'border-2 border-orange-500' : ''}`} />
                <p className={`font-semibold flex-1 ${isTodayCook ? 'text-orange-900' : 'text-slate-700'}`}>{m.name}</p>
                {isTodayCook && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">আজকে</span>}
              </div>
             )
          })}
        </div>
      </div>

      {/* Cleaning Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-blue-50 px-5 py-4 border-b border-blue-100 flex items-center gap-3">
          <span className="text-2xl">🧹</span>
          <h3 className="font-bold text-blue-900 text-lg">পরিষ্কারের সিরিয়াল (৫ দিন পর পর)</h3>
        </div>
        <div className="p-2">
          {MEMBERS.map((m, idx) => {
             const isTodayCleaner = memberNamesOnly[getCleanerIndex(today)] === m.name;
             return (
              <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl mb-1 ${isTodayCleaner ? 'bg-blue-100 border border-blue-200' : ''}`}>
                <img src={m.img} alt={m.name} className={`w-10 h-10 rounded-full object-cover ${isTodayCleaner ? 'border-2 border-blue-500' : ''}`} />
                <p className={`font-semibold flex-1 ${isTodayCleaner ? 'text-blue-900' : 'text-slate-700'}`}>{m.name}</p>
                {isTodayCleaner && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-lg">চলমান</span>}
              </div>
             )
          })}
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-slate-800">হিসাব-নিকাশ</h2>
        <select 
          className="bg-white border border-slate-200 text-sm font-bold rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {monthNames.map((m, idx) => <option key={idx} value={idx}>{m} মাস</option>)}
        </select>
      </div>

      {/* Add New Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <input 
            type="text" 
            placeholder="কী বাজার করা হলো?" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={newItemText} onChange={(e)=>setNewItemText(e.target.value)} required 
          />
          <div className="flex gap-3">
            <input 
              type="number" placeholder="টাকা" 
              className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={newAmount} onChange={(e)=>setNewAmount(e.target.value)} required 
            />
            <select 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedBuyer} onChange={(e)=>setSelectedBuyer(e.target.value)}
            >
              {memberNamesOnly.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors">
            হিসাবে যুক্ত করুন
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-700 mb-4">বাজারের তালিকা</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {activeMonthItems.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">কোনো হিসাব নেই</p>
          ) : (
            activeMonthItems.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{item.item}</p>
                  <p className="text-xs text-slate-500 mt-0.5">ক্রেতা: <span className="font-semibold text-emerald-700">{item.buyer}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-700">৳{convertToBanglaNumber(item.amount)}</span>
                  <button onClick={()=>handleDeleteExpense(item.id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-md">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-24 md:pb-8 flex justify-center">
      
      {/* Mobile-first Container */}
      <div className="w-full max-w-md bg-slate-100 min-h-screen relative flex flex-col shadow-2xl">
        
        {/* Top App Bar */}
        <header className="bg-white px-5 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
              ল
            </div>
            <div>
              <h1 className="font-black text-slate-800 text-lg leading-tight">লিল্লাহি এতিমখানা</h1>
              <p className="text-[10px] font-bold text-emerald-600 tracking-wider">ম্যানেজমেন্ট ড্যাশবোর্ড</p>
            </div>
          </div>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-emerald-500 bg-emerald-50 p-2 rounded-full hover:bg-emerald-100 transition">
            <WhatsappIcon />
          </a>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-5 overflow-y-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'accounts' && renderAccounts()}
        </main>

        {/* Bottom Navigation Bar (App-like) */}
        <nav className="fixed md:absolute bottom-0 w-full max-w-md bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <HomeIcon />
            <span className="text-[10px] font-bold">হোম</span>
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'schedule' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <CalendarIcon />
            <span className="text-[10px] font-bold">শিডিউল</span>
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'accounts' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <WalletIcon />
            <span className="text-[10px] font-bold">হিসাব</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
