import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// ================= CONFIG =================
const APP_PIN = "7307"; // কোডে পিন দেওয়া আছে, কিন্তু ওয়েবসাইটের স্ক্রিনে আর দেখাবে না
const PIN_STORAGE_KEY = "lillahi_pin_ok_v1";

// ================= MEMBERS =================
const MEMBERS = [
  { id: "m1", name: "মহসিন" },
  { id: "m2", name: "জিসান" },
];

const memberNamesOnly = MEMBERS.map((m) => m.name);

// ================= FIXED =================
const FIXED_RENT_PER_PERSON = 350;

// ================= HELPERS =================
const pad2 = (n) => String(n).padStart(2, "0");
const currentMonthKey = () => `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`;

const formatDateForInput = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

// ================= AVATAR COMPONENT =================
// আপনার গিটহাবের src ফোল্ডারে থাকা ছবিগুলো এখানে লোড হবে
const MemberAvatar = ({ name }) => {
  let src = "";
  if (name === "মহসিন") src = new URL("./MAHSIN.jpeg", import.meta.url).href;
  else if (name === "জিসান") src = new URL("./JISAN.jpeg", import.meta.url).href;

  return (
    <img
      src={src}
      alt={name}
      className="w-16 h-16 rounded-2xl object-cover border-4 border-gray-100 shadow-sm"
      onError={(e) => e.target.src = `https://via.placeholder.com/64?text=${name[0]}`}
    />
  );
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

  // Firestore Data Fetching
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

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMarketItems(items);
      setLoading(false);
    });

    return unsub;
  }, [monthKey]);

  // Handle PIN Unlock
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

  // Handle Add Expense (এই ফাংশনটি না থাকার কারণেই সাদা পেজ আসতো)
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newItemText || !newAmount) return;

    try {
      await addDoc(collection(db, "expenses"), {
        text: newItemText,
        amount: Number(newAmount),
        buyer: selectedBuyer,
        timestamp: new Date(selectedDate).getTime()
      });
      
      // সফলভাবে ডাটা সেভ হওয়ার পর ইনপুট ফিল্ডগুলো খালি করে দেওয়া
      setNewItemText("");
      setNewAmount("");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("ডাটা সেভ করতে সমস্যা হয়েছে!");
    }
  };

  // Calculations
  const totalMarketExpense = marketItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const memberSpending = {};
  memberNamesOnly.forEach(n => memberSpending[n] = 0);
  marketItems.forEach(i => {
    if (memberSpending[i.buyer] !== undefined) memberSpending[i.buyer] += Number(i.amount || 0);
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

  // Locked Screen UI
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-xs p-8 text-center shadow-2xl">
          <h1 className="text-4xl font-black mb-2">হিসাব</h1>
          <p className="text-gray-600 mb-8">মহসিন ও জিসান</p>
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="****" // পিনকোড হিডেন করা হয়েছে
            className="w-full text-3xl text-center py-5 border-2 rounded-2xl focus:border-blue-600 outline-none tracking-widest"
          />
          {pinError && <p className="text-red-500 mt-4 font-bold">{pinError}</p>}
          <button onClick={unlock} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-lg transition">
            প্রবেশ করুন
          </button>
        </div>
      </div>
    );
  }

  // Unlocked Main UI
  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-3xl font-bold text-center mb-8">📊 হিসাব</h1>

      <div className="max-w-md mx-auto space-y-6">
        {/* Total Market Expense */}
        <div className="bg-white rounded-3xl p-8 text-center shadow">
          <p className="text-gray-500 font-semibold">মোট বাজার খরচ</p>
          <p className="text-5xl font-black text-blue-600 mt-3">৳{totalMarketExpense.toFixed(2)}</p>
        </div>

        {/* Individual Balances & Avatars */}
        <div className="space-y-4">
          {memberNamesOnly.map((name) => (
            <div key={name} className="bg-white rounded-3xl p-6 shadow flex items-center gap-5">
              <MemberAvatar name={name} />
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-800">{name}</p>
                <p className={`text-2xl font-black mt-1 ${balances[name] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balances[name] >= 0 ? '+' : '-'}৳{Math.abs(balances[name]).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Settlement Logic */}
        <div className="bg-white rounded-3xl p-6 shadow border-l-4 border-blue-500">
          <h3 className="font-bold text-lg mb-4 text-gray-800">কে কাকে কত দিবে?</h3>
          {settlements.length === 0 ? (
            <p className="text-green-600 font-bold text-lg flex items-center gap-2">
              <span>🎉</span> সব হিসাব সমান!
            </p>
          ) : (
            settlements.map((s, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-lg text-gray-700">
                  <span className="font-bold text-gray-900">{s.from}</span> দিবে <span className="font-bold text-gray-900">{s.to}</span> কে
                </p>
                <p className="text-2xl font-black text-red-600 mt-1">৳{s.amount.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Expense Form */}
        <div className="bg-white rounded-3xl p-6 shadow">
          <h3 className="font-bold text-lg mb-4 text-gray-800">নতুন খরচ যোগ করুন</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <input
              type="text"
              placeholder="পণ্যের নাম (যেমন: চাল, ডাল)"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition"
              required
            />
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                placeholder="টাকার পরিমাণ"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="flex-1 p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition"
                required
              />
              <select 
                value={selectedBuyer} 
                onChange={(e) => setSelectedBuyer(e.target.value)} 
                className="p-4 border-2 border-gray-200 rounded-2xl bg-white outline-none focus:border-blue-500 transition font-bold"
              >
                {memberNamesOnly.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition text-gray-600" 
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg transition shadow-lg mt-2">
              ➕ যোগ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
