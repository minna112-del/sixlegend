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
const APP_PIN = "7307";
const PIN_STORAGE_KEY = "lillahi_pin_ok_v1";

const WHATSAPP_GROUP_INVITE_URL = "https://chat.whatsapp.com/C8dEbHfrmKfERqSGDxreuK";

// ================= MEMBERS =================
const MEMBERS = [
  { id: "m1", name: "মহসিন", img: "/mahsin.jpg", phone: "15165858019" },
  { id: "m2", name: "জিসান", img: "/jisan.jpg", phone: "XXXXXXXXXX" },
];

const memberNamesOnly = MEMBERS.map((m) => m.name);

// ================= FIXED EXPENSES =================
const FIXED_RENT_PER_PERSON = 350;

// ================= HELPERS =================
const pad2 = (n) => String(n).padStart(2, "0");
const currentMonthKey = () => `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`;

const formatDateForInput = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const convertToBanglaNumber = (num) => {
  const bn = {0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯"};
  return Number(num || 0).toFixed(2).replace(/[0-9]/g, m => bn[m]);
};

const monthLabelBn = (key) => {
  const [y, m] = key.split("-").map(Number);
  const months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
  return `${months[m-1]} ${y}`;
};

// ================= APP =================
export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem(PIN_STORAGE_KEY) === "1");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newItemText, setNewItemText] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(Date.now()));

  const [editingId, setEditingId] = useState(null);
  const [editItemText, setEditItemText] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editBuyer, setEditBuyer] = useState("");
  const [editDate, setEditDate] = useState("");

  const [shareOpen, setShareOpen] = useState(false);
  const [shareText, setShareText] = useState("");

  // Firestore
  useEffect(() => {
    setLoading(true);
    const [yy, mm] = monthKey.split("-").map(Number);
    const start = new Date(yy, mm - 1, 1).getTime();
    const end = new Date(yy, mm, 1).getTime();

    const q = query(collection(db, "expenses"),
      where("timestamp", ">=", start),
      where("timestamp", "<", end),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMarketItems(items);
      setLoading(false);
    });

    return unsub;
  }, [monthKey]);

  const unlock = () => {
    if (pinInput === APP_PIN) {
      localStorage.setItem(PIN_STORAGE_KEY, "1");
      setIsUnlocked(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("ভুল পিন! আবার চেষ্টা করুন");
    }
  };

  // Calculations
  const totalMarketExpense = marketItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalRent = 700;
  const grandTotal = totalMarketExpense + totalRent;

  const memberSpending = {};
  memberNamesOnly.forEach(name => memberSpending[name] = 0);
  marketItems.forEach(item => {
    if (memberSpending[item.buyer] !== undefined) memberSpending[item.buyer] += Number(item.amount);
  });

  const perPersonMarket = totalMarketExpense / 2;
  const perPersonTotal = {};
  memberNamesOnly.forEach(name => {
    perPersonTotal[name] = perPersonMarket + FIXED_RENT_PER_PERSON;
  });

  const balances = {};
  memberNamesOnly.forEach(name => {
    balances[name] = memberSpending[name] - perPersonTotal[name];
  });

  const settlements = useMemo(() => {
    const [a, b] = memberNamesOnly;
    if (balances[a] > 0 && balances[b] < 0) return [{ from: b, to: a, amount: Math.abs(balances[b]) }];
    if (balances[b] > 0 && balances[a] < 0) return [{ from: a, to: b, amount: Math.abs(balances[a]) }];
    return [];
  }, [balances]);

  const MemberAvatar = ({ name }) => {
    const src = name === "মহসিন" ? "/mahsin.jpg" : "/jisan.jpg";
    return (
      <img 
        src={src} 
        alt={name}
        className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md"
        onError={(e) => e.target.src = `https://via.placeholder.com/56?text=${name[0]}`}
      />
    );
  };

  // Lock Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-10">
            <h1 className="text-4xl font-black tracking-wider">হিসাব</h1>
            <p className="mt-2 opacity-90">মহসিন ও জিসান</p>
          </div>
          <div className="p-8 space-y-6">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="পিন দিন"
              className="w-full text-center text-3xl tracking-widest py-5 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none"
            />
            {pinError && <p className="text-red-500 text-center font-medium">{pinError}</p>}
            <button
              onClick={unlock}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl text-lg active:scale-95 transition"
            >
              প্রবেশ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-[420px] mx-auto px-5 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">📊 হিসাব</h1>
          <button onClick={() => window.location.reload()} className="text-blue-600 font-medium">রিফ্রেশ</button>
        </div>
      </div>

      <div className="max-w-[420px] mx-auto px-5 pt-6 space-y-8">

        {/* Total Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl p-8 text-center shadow-xl">
          <p className="text-blue-100 text-sm">মোট বাজার খরচ</p>
          <p className="text-5xl font-black mt-2">৳{totalMarketExpense.toFixed(2)}</p>
        </div>

        {/* Balances */}
        <div className="space-y-4">
          {memberNamesOnly.map((name) => (
            <div key={name} className="bg-white rounded-3xl p-5 shadow flex items-center gap-5">
              <MemberAvatar name={name} />
              <div className="flex-1">
                <p className="font-semibold text-xl">{name}</p>
                <p className={`text-2xl font-bold ${balances[name] >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ৳{balances[name].toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Settlement */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-3xl p-6">
          <h3 className="font-bold text-lg mb-4">কে কাকে কত দিবে</h3>
          {settlements.length === 0 ? (
            <p className="text-emerald-600 font-medium flex items-center gap-2">
              🎉 সব হিসাব সমান <span className="text-2xl">👍</span>
            </p>
          ) : (
            settlements.map((s, i) => (
              <p key={i} className="text-lg font-medium">
                👉 <b>{s.from}</b> দিবে <b>{s.to}</b> কে <span className="text-red-600 font-bold">৳{s.amount.toFixed(2)}</span>
              </p>
            ))
          )}
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-3xl p-6 shadow">
          <h3 className="font-bold text-lg mb-4">নতুন খরচ যোগ করুন</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <input
              type="text"
              placeholder="পণ্যের নাম"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full p-4 border rounded-2xl text-lg"
              required
            />
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                placeholder="টাকার পরিমাণ"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="flex-1 p-4 border rounded-2xl text-lg"
                required
              />
              <select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                className="p-4 border rounded-2xl text-lg"
              >
                {memberNamesOnly.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-4 border rounded-2xl"
            />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg active:bg-blue-700">
              ➕ যোগ করুন
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}