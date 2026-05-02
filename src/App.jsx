Import React, { useEffect, useState } from "react";
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

// ছবি ও ভিডিও ইমপোর্ট করা হলো
import hisabImage from './hisab.jpeg';
import mahsinImg from './MAHSIN.jpeg';
import jisanImg from './JISAN.jpeg';
import splashVideo from './splash_video.mp4'; 

// ================= CONFIG =================
const APP_PIN = "7307"; 

// ================= MEMBERS =================
const MEMBERS = [
  { id: "m1", name: "মহসিন" },
  { id: "m2", name: "জিসান" },
];

const memberNamesOnly = MEMBERS.map((m) => m.name);

// ================= HELPERS =================
const pad2 = (n) => String(n).padStart(2, "0");
const currentMonthKey = () => `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`;

const formatDateForInput = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

// ================= AVATAR COMPONENT =================
const MemberAvatar = ({ name }) => {
  let src = name === "মহসিন" ? mahsinImg : jisanImg;
  return (
    <img
      src={src}
      alt={name}
      className="w-16 h-16 rounded-full object-cover object-top border-4 border-blue-500 shadow-lg scale-110"
      onError={(e) => e.target.src = `https://via.placeholder.com/64?text=${name[0]}`}
    />
  );
};

// ================= APP =================
export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [showSplash, setShowSplash] = useState(false); 
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [marketItems, setMarketItems] = useState([]);
  const [shoppingList, setShoppingList] = useState([]); 
  const [loading, setLoading] = useState(true);

  // States
  const [newItemText, setNewItemText] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(Date.now()));
  const [newShoppingItem, setNewShoppingItem] = useState("");

  // Action & Modal States
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", item: null, error: "" });
  const [actionPinInput, setActionPinInput] = useState("");
  const [editModal, setEditModal] = useState({ isOpen: false, id: "", text: "", amount: "", buyer: "", date: "" });

  useEffect(() => {
    setLoading(true);
    const [yy, mm] = monthKey.split("-").map(Number);
    const start = new Date(yy, mm - 1, 1).getTime();
    const end = new Date(yy, mm, 1).getTime();

    const qExpenses = query(collection(db, "expenses"), where("timestamp", ">=", start), where("timestamp", "<", end), orderBy("timestamp", "desc"));
    const unsubExpenses = onSnapshot(qExpenses, (snap) => {
      setMarketItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const qShopping = query(collection(db, "shopping_list"), orderBy("timestamp", "asc"));
    const unsubShopping = onSnapshot(qShopping, (snap) => setShoppingList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubExpenses(); unsubShopping(); };
  }, [monthKey]);

  // পিন আনলক ও স্প্ল্যাশ ভিডিও প্লেয়ার
  const unlock = () => {
    if (pinInput === APP_PIN) {
      setPinError("");
      setPinInput("");
      setShowSplash(true); 
      
      // ভিডিওর সময়কাল ৮ সেকেন্ড (8000) করে দেওয়া হলো
      setTimeout(() => {
        setShowSplash(false);
        setIsUnlocked(true); 
      }, 3000); 

    } else { setPinError("ভুল পিন! আবার চেষ্টা করুন"); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newItemText || !newAmount) return;
    try {
      await addDoc(collection(db, "expenses"), { text: newItemText, amount: Number(newAmount), buyer: selectedBuyer, timestamp: new Date(selectedDate).getTime() });
      setNewItemText(""); setNewAmount("");
    } catch (error) { 
      console.error(error);
      alert("ডাটা সেভ করতে সমস্যা হয়েছে!"); 
    }
  };

  const handleAddShoppingItem = async (e) => {
    e.preventDefault();
    if (!newShoppingItem) return;
    try {
      await addDoc(collection(db, "shopping_list"), { text: newShoppingItem, timestamp: Date.now() });
      setNewShoppingItem("");
    } catch (error) { console.error(error); }
  };

  const deleteShoppingItem = async (id) => {
    try { await deleteDoc(doc(db, "shopping_list", id)); } catch (error) { console.error(error); }
  };

  const verifyActionPin = async () => {
    const { type, item } = actionModal;
    if (type === 'delete') {
      try {
        await deleteDoc(doc(db, "expenses", item.id));
        setActionModal({ isOpen: false, type: "", item: null, error: "" });
      } catch (error) { alert("ডিলেট করতে সমস্যা হয়েছে!"); }
    } else if (type === 'edit') {
      setEditModal({ isOpen: true, id: item.id, text: item.text, amount: item.amount, buyer: item.buyer, date: formatDateForInput(item.timestamp) });
      setActionModal({ isOpen: false, type: "", item: null, error: "" });
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "expenses", editModal.id), { text: editModal.text, amount: Number(editModal.amount), buyer: editModal.buyer, timestamp: new Date(editModal.date).getTime() });
      setEditModal({ isOpen: false, id: "", text: "", amount: "", buyer: "", date: "" });
    } catch (error) { alert("আপডেট ব্যর্থ হয়েছে!"); }
  };

  // CALCULATIONS
  const totalMarketExpense = marketItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const memberSpending = {};
  memberNamesOnly.forEach(n => memberSpending[n] = 0);
  marketItems.forEach(i => { if (memberSpending[i.buyer] !== undefined) memberSpending[i.buyer] += Number(i.amount || 0); });
  const perPersonMarket = totalMarketExpense / 2;
  const balances = {};
  memberNamesOnly.forEach(name => { balances[name] = memberSpending[name] - perPersonMarket; });

  // ================= ৫-সেকেন্ডের ভিডিও স্প্ল্যাশ স্ক্রিন =================
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
        <video 
          src={splashVideo} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // ================= লক স্ক্রিন =================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4 text-center">
        <div className="bg-white rounded-3xl w-full max-w-xs p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <img src={hisabImage} alt="Hishab Logo" className="w-20 h-20 rounded-2xl object-cover mb-2" />
            <h1 className="text-4xl font-black mb-2">হিসাব</h1>
            <p className="text-gray-600">মহসিন ও জিসান</p>
          </div>
          <input type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="••••" className="w-full text-3xl text-center py-5 border-2 rounded-2xl outline-none tracking-widest font-mono" />
          {pinError && <p className="text-red-500 mt-4 font-bold">{pinError}</p>}
          <button onClick={unlock} className="mt-6 w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg transition shadow-lg">প্রবেশ করুন</button>
        </div>
      </div>
    );
  }

  // ================= মূল অ্যাপ (আনলকড) =================
  return (
    <div className="min-h-screen relative p-5 pb-20">
      
      {/* গ্লোবাল ফন্ট ইমপোর্ট */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');`}
      </style>

      {/* Background Image Setup */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[4px] z-10"></div>
        <img src={hisabImage} className="w-full h-full object-cover z-0" alt="background" />
      </div>

      <div className="max-w-md mx-auto space-y-6 relative z-20">
        
        {/* Main Title with Calligraphy */}
        <div className="flex flex-col items-center mb-8">
          <img src={hisabImage} alt="Hishab Logo" className="w-20 h-20 rounded-2xl object-cover mb-2 shadow-lg" />
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">ডিজিটাল হিসাব</h1>
          <p style={{ fontFamily: "'Dancing Script', cursive" }} className="text-blue-600 text-xl font-bold mt-1 tracking-wider drop-shadow-md">
            Powered by Mahsin
          </p>
        </div>
        
        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-600 rounded-3xl p-5 text-white shadow-lg flex flex-col items-center justify-center text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">মোট বাজার</p>
            <p className="text-2xl font-black mt-1">৳{totalMarketExpense.toFixed(0)}</p>
          </div>
          
          <div className="relative bg-white rounded-3xl p-5 text-gray-800 shadow shadow-blue-100 flex flex-col items-center justify-center text-center border border-blue-50 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.15] bg-cover bg-top" style={{ backgroundImage: `url(${mahsinImg})` }}></div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-bold tracking-widest text-blue-600 drop-shadow-md">মহসিন করেছে</p>
              <p className="text-2xl font-black mt-1 text-gray-900 drop-shadow-md">৳{memberSpending['মহসিন'].toFixed(0)}</p>
            </div>
          </div>
          
          <div className="relative bg-white rounded-3xl p-5 text-gray-800 shadow shadow-blue-100 flex flex-col items-center justify-center text-center border border-blue-50 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.15] bg-cover bg-top" style={{ backgroundImage: `url(${jisanImg})` }}></div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-bold tracking-widest text-blue-600 drop-shadow-md">জিসান করেছে</p>
              <p className="text-2xl font-black mt-1 text-gray-900 drop-shadow-md">৳{memberSpending['জিসান'].toFixed(0)}</p>
            </div>
          </div>

          <div className="bg-yellow-400 rounded-3xl p-5 text-yellow-900 shadow-lg flex flex-col items-center justify-center text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">বাজার করতে হবে</p>
            <p className="text-2xl font-black mt-1">{shoppingList.length}টি আইটেম</p>
          </div>
        </div>

        {/* Shopping List Section (একক লিস্ট) */}
        <div className="bg-yellow-50/90 backdrop-blur-sm rounded-3xl p-6 shadow-md border-t-8 border-yellow-400">
          <h3 className="font-bold text-xl mb-5 text-gray-800 flex items-center gap-2">🛒 কি কি আনতে হবে?</h3>
          <form onSubmit={handleAddShoppingItem} className="flex gap-2 mb-6">
            <input type="text" placeholder="জিনিসের নাম..." value={newShoppingItem} onChange={(e) => setNewShoppingItem(e.target.value)} className="flex-1 p-3 border-2 border-yellow-200 rounded-2xl outline-none focus:border-yellow-400" required />
            <button type="submit" className="bg-yellow-400 text-yellow-900 px-6 rounded-2xl font-black text-xl shadow-sm">➕</button>
          </form>
          <div className="space-y-2">
            {shoppingList.length === 0 ? (
              <p className="text-gray-400 text-sm italic">কোনো আইটেম নেই।</p>
            ) : (
              shoppingList.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-yellow-100 shadow-sm">
                  <span className="text-gray-800 font-semibold">{item.text}</span>
                  <button onClick={() => deleteShoppingItem(item.id)} className="text-red-400 font-bold px-2 hover:scale-125 transition">✕</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Individual Balances */}
        <div className="space-y-6">
          {memberNamesOnly.map((name) => (
            <div key={name} className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-md flex items-center gap-6 border border-gray-100">
              <MemberAvatar name={name} />
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-800">{name}</p>
                <p className={`text-3xl font-black mt-1 ${balances[name] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balances[name] >= 0 ? '+' : '-'}৳{Math.abs(balances[name]).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Expense Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-gray-800">নতুন বাজার খরচ যোগ করুন</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <input type="text" placeholder="পণ্যের নাম..." value={newItemText} onChange={(e) => setNewItemText(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500" required />
            <div className="flex gap-3">
              <input type="number" step="0.01" placeholder="টাকা" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="flex-1 p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500" required />
              <select value={selectedBuyer} onChange={(e) => setSelectedBuyer(e.target.value)} className="p-4 border-2 border-gray-200 rounded-2xl bg-white outline-none focus:border-blue-500 font-bold">
                {memberNamesOnly.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 text-gray-600" />
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-blue-700 transition">সেভ করুন</button>
          </form>
        </div>

        {/* Expense History List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-gray-800">খরচের তালিকা</h3>
          <div className="space-y-3">
            {marketItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{item.text}</p>
                  <p className="text-sm text-gray-500">{item.buyer} • {new Date(item.timestamp).toLocaleDateString('bn-BD')}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-blue-600 text-xl">৳{item.amount.toFixed(2)}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setActionModal({ isOpen: true, type: 'edit', item, error: "" })} className="bg-blue-100 p-2 rounded-lg">✏️</button>
                    <button onClick={() => setActionModal({ isOpen: true, type: 'delete', item, error: "" })} className="bg-red-100 p-2 rounded-lg">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Modals (Delete/Edit) */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl">
            <h3 className="font-bold text-xl mb-4">সিকিউরিটি পিন দিন</h3>
            <input type="password" maxLength={4} value={actionPinInput} onChange={(e) => setActionPinInput(e.target.value)} placeholder="••••" className="w-full text-3xl text-center py-4 border-2 rounded-2xl outline-none focus:border-blue-600 tracking-widest mb-2 font-mono" />
            {actionModal.error && <p className="text-red-500 font-bold mb-4">{actionModal.error}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setActionModal({ isOpen: false, type: "", item: null, error: "" })} className="flex-1 bg-gray-200 py-3 rounded-2xl font-bold">বাতিল</button>
              <button onClick={verifyActionPin} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold">নিশ্চিত</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-xl mb-4 text-center">সংশোধন করুন</h3>
            <form onSubmit={handleUpdateExpense} className="space-y-4">
              <input type="text" value={editModal.text} onChange={(e) => setEditModal({ ...editModal, text: e.target.value })} className="w-full p-4 border-2 border-gray-200 rounded-2xl" required />
              <div className="flex gap-3">
                <input type="number" step="0.01" value={editModal.amount} onChange={(e) => setEditModal({ ...editModal, amount: e.target.value })} className="flex-1 p-4 border-2 border-gray-200 rounded-2xl" required />
                <select value={editModal.buyer} onChange={(e) => setEditModal({ ...editModal, buyer: e.target.value })} className="p-4 border-2 border-gray-200 rounded-2xl font-bold">
                  {memberNamesOnly.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <input type="date" value={editModal.date} onChange={(e) => setEditModal({ ...editModal, date: e.target.value })} className="w-full p-4 border-2 border-gray-200 rounded-2xl" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditModal({ isOpen: false, id: "", text: "", amount: "", buyer: "", date: "" })} className="flex-1 bg-gray-200 py-4 rounded-2xl font-bold">বাতিল</button>
                <button type="submit" className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black">আপডেট</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}