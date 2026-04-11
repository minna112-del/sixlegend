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

const convertToBanglaNumber = (num) => {
  const bn = {0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯"};
  return Number(num || 0).toFixed(2).replace(/[0-9]/g, m => bn[m]);
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

  // Firestore
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

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-xs p-8 text-center">
          <h1 className="text-3xl font-bold mb-6">হিসাব</h1>
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="7307"
            className="w-full text-3xl text-center py-4 border-2 rounded-2xl"
          />
          {pinError && <p className="text-red-500 mt-2">{pinError}</p>}
          <button onClick={unlock} className="mt-6 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">
            প্রবেশ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">📊 হিসাব</h1>

      {/* Total */}
      <div className="bg-white rounded-3xl p-8 text-center shadow mb-8">
        <p className="text-gray-500">মোট বাজার খরচ</p>
        <p className="text-5xl font-black text-blue-600">৳{totalMarketExpense.toFixed(2)}</p>
      </div>

      {/* Balances */}
      <div className="space-y-4 mb-8">
        {memberNamesOnly.map((name) => (
          <div key={name} className="bg-white rounded-3xl p-6 shadow flex justify-between items-center">
            <div>
              <p className="text-xl font-semibold">{name}</p>
            </div>
            <p className={`text-3xl font-bold ${balances[name] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{balances[name].toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Settlement */}
      <div className="bg-white rounded-3xl p-6 shadow mb-8">
        <h3 className="font-bold mb-4">কে কাকে কত দিবে</h3>
        {settlements.length === 0 ? (
          <p className="text-green-600 text-lg">🎉 সব হিসাব সমান</p>
        ) : (
          settlements.map((s, i) => (
            <p key={i} className="text-lg py-2">
              👉 <b>{s.from}</b> দিবে <b>{s.to}</b> কে <span className="text-red-600">৳{s.amount.toFixed(2)}</span>
            </p>
          ))
        )}
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-3xl p-6 shadow">
        <h3 className="font-bold mb-4">নতুন খরচ যোগ করুন</h3>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <input
            type="text"
            placeholder="পণ্যের নাম"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="w-full p-4 border rounded-2xl"
            required
          />
          <div className="flex gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="টাকা"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="flex-1 p-4 border rounded-2xl"
              required
            />
            <select value={selectedBuyer} onChange={(e) => setSelectedBuyer(e.target.value)} className="p-4 border rounded-2xl">
              {memberNamesOnly.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 border rounded-2xl" />
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">
            ➕ যোগ করুন
          </button>
        </form>
      </div>
    </div>
  );
}