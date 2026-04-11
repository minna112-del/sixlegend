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

const WHATSAPP_GROUP_INVITE_URL = "https://chat.whatsapp.com/C8dEbHfrmKfERqSGDxreuK";

// ================= MEMBERS (শুধু ২ জন) =================
const MEMBERS = [
  { id: "m1", name: "মহসিন", img: "/mahsin.jpg", phone: "15165858019" },
  { id: "m2", name: "জিসান", img: "/jisan.jpg", phone: "XXXXXXXXXX" },   // তোমার ফোন নাম্বার দাও
];

const memberNamesOnly = MEMBERS.map((m) => m.name);

// ================= FIXED EXPENSES =================
const FIXED_RENT_PER_PERSON = 350;   // 700 / 2

// ================= HELPERS =================
const pad2 = (n) => String(n).padStart(2, "0");
const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

const formatDateForInput = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const convertToBanglaNumber = (number) => {
  const banglaNumbers = { 0: "০", 1: "১", 2: "২", 3: "৩", 4: "৪", 5: "৫", 6: "৬", 7: "৭", 8: "৮", 9: "৯" };
  return Number(number || 0).toFixed(2).replace(/[0-9]/g, (x) => banglaNumbers[x]);
};

const monthLabelBn = (monthKey) => {
  const [y, m] = monthKey.split("-").map(Number);
  const names = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  return `${names[m - 1]} ${y}`;
};

// ================= APP =================
export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem(PIN_STORAGE_KEY) === "1");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [newItemText, setNewItemText] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(Date.now()));

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editItemText, setEditItemText] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editBuyer, setEditBuyer] = useState("");
  const [editDate, setEditDate] = useState("");

  // Firestore listener
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
      setIsUnlocked(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("ভুল কোড। আবার চেষ্টা করুন।");
    }
  };

  // Calculations
  const totalMarketExpense = marketItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const memberSpending = {};
  memberNamesOnly.forEach((name) => (memberSpending[name] = 0));
  marketItems.forEach((item) => {
    if (memberSpending[item.buyer] !== undefined) {
      memberSpending[item.buyer] += Number(item.amount || 0);
    }
  });

  const perPersonMarket = totalMarketExpense / 2;
  const perPersonTotal = {};
  memberNamesOnly.forEach((name) => {
    perPersonTotal[name] = perPersonMarket + FIXED_RENT_PER_PERSON;
  });

  const balances = {};
  memberNamesOnly.forEach((name) => {
    balances[name] = memberSpending[name] - perPersonTotal[name];
  });

  // Simple settlement (2 persons)
  const settlements = useMemo(() => {
    const [a, b] = memberNamesOnly;
    const balA = balances[a];
    const balB = balances[b];
    const result = [];

    if (balA > 0 && balB < 0) {
      result.push({ from: b, to: a, amount: Math.abs(balB) });
    } else if (balB > 0 && balA < 0) {
      result.push({ from: a, to: b, amount: Math.abs(balA) });
    }
    return result;
  }, [balances]);

  // ================= UI (সুন্দর ভার্সন) =================
  if (!isUnlocked) {
    // তোমার আগের লক স্ক্রিন রাখতে পারো
    return ( /* তোমার পুরনো lock UI */ );
  }

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "auto", fontFamily: "sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>📊 হিসাব (মহসিন + জিসান)</h2>

      {/* Total */}
      <div style={{ background: "#111827", color: "white", padding: 20, borderRadius: 16, marginBottom: 20, textAlign: "center" }}>
        <h3>মোট বাজার খরচ: ৳{totalMarketExpense.toFixed(2)}</h3>
      </div>

      {/* Balances with Avatar */}
      <div style={{ marginBottom: 24 }}>
        {memberNamesOnly.map((name) => {
          const avatarSrc = name === "মহসিন" ? "/mahsin.jpg" : "/jisan.jpg";
          return (
            <div key={name} style={{
              background: "#fff", padding: 16, borderRadius: 16, marginBottom: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 16
            }}>
              <img 
                src={avatarSrc} 
                alt={name}
                style={{ width: 65, height: 65, borderRadius: "50%", objectFit: "cover", border: "3px solid #2563eb" }}
                onError={(e) => e.target.src = "https://via.placeholder.com/65?text=" + name[0]}
              />
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 19 }}>{name}</b><br />
                <span style={{ fontSize: 17, fontWeight: "bold", color: balances[name] >= 0 ? "#10b981" : "#ef4444" }}>
                  ৳{balances[name].toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settlement */}
      <div style={{ background: "#ecfeff", padding: 20, borderRadius: 16, marginBottom: 24 }}>
        <h4>কে কাকে কত দিবে</h4>
        {settlements.length === 0 ? (
          <p style={{ color: "#0e7490", fontWeight: "bold" }}>🎉 সব হিসাব সমান!</p>
        ) : (
          settlements.map((s, i) => (
            <p key={i} style={{ fontSize: 17, margin: "12px 0" }}>
              👉 <b>{s.from}</b> দিবে <b>{s.to}</b> কে <b>৳{s.amount.toFixed(2)}</b>
            </p>
          ))
        )}
      </div>

      {/* Add Form + List - তোমার আগের ফর্ম ও লিস্ট রাখতে পারো বা আমাকে বলো আরও সুন্দর করে দিব */}

      {/* ... (Add form + expense list) ... */}

    </div>
  );
}
