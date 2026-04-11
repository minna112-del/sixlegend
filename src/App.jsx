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

// ================= EXPENSE =================
const FIXED_EXPENSES = { rent: 350, electricity: 30, wifi: 14 };
const WIFI_EXEMPT_NAME = "";

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

// ================= APP =================
export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem(PIN_STORAGE_KEY) === "1"
  );
  const [pinInput, setPinInput] = useState("");

  const [monthKey] = useState(currentMonthKey());
  const [marketItems, setMarketItems] = useState([]);

  const [newItemText, setNewItemText] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);
  const [selectedDate, setSelectedDate] = useState(
    formatDateForInput(Date.now())
  );

  const [editingId, setEditingId] = useState(null);
  const [editItemText, setEditItemText] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editBuyer, setEditBuyer] = useState("");
  const [editDate, setEditDate] = useState("");

  // ================= FIRESTORE =================
  useEffect(() => {
    const [yy, mm] = monthKey.split("-").map(Number);
    const start = new Date(yy, mm - 1, 1).getTime();
    const end = new Date(yy, mm, 1).getTime();

    const q = query(
      collection(db, "expenses"),
      where("timestamp", ">=", start),
      where("timestamp", "<", end),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setMarketItems(items);
    });
  }, [monthKey]);

  // ================= ADD =================
  const handleAddExpense = async (e) => {
    e.preventDefault();

    const ts = new Date(selectedDate + "T12:00:00").getTime();

    await addDoc(collection(db, "expenses"), {
      item: newItemText,
      amount: Number(parseFloat(newAmount).toFixed(2)),
      buyer: selectedBuyer,
      timestamp: ts,
    });

    setNewItemText("");
    setNewAmount("");
  };

  // ================= DELETE =================
  const handleDeleteExpense = async (id) => {
    await deleteDoc(doc(db, "expenses", id));
  };

  // ================= EDIT =================
  const handleEditExpense = (item) => {
    setEditingId(item.id);
    setEditItemText(item.item);
    setEditAmount(item.amount);
    setEditBuyer(item.buyer);
    setEditDate(formatDateForInput(item.timestamp));
  };

  const handleSaveEdit = async (id) => {
    const ts = new Date(editDate + "T12:00:00").getTime();

    await updateDoc(doc(db, "expenses", id), {
      item: editItemText,
      amount: Number(parseFloat(editAmount).toFixed(2)),
      buyer: editBuyer,
      timestamp: ts,
    });

    setEditingId(null);
  };

  // ================= CALC =================
  const totalMembers = MEMBERS.length;

  const totalMarketExpense = marketItems.reduce(
    (s, i) => s + Number(i.amount || 0),
    0
  );

  const memberSpending = {};
  memberNamesOnly.forEach((n) => (memberSpending[n] = 0));

  marketItems.forEach((i) => {
    memberSpending[i.buyer] += Number(i.amount || 0);
  });

  const perPersonMarket = totalMarketExpense / totalMembers;

  const perPersonTotal = {};
  memberNamesOnly.forEach((name) => {
    let total = perPersonMarket + FIXED_EXPENSES.rent;
    if (name !== WIFI_EXEMPT_NAME) total += FIXED_EXPENSES.wifi;
    total += FIXED_EXPENSES.electricity;
    perPersonTotal[name] = total;
  });

  const balances = {};
  memberNamesOnly.forEach((name) => {
    balances[name] = memberSpending[name] - perPersonTotal[name];
  });

  // ================= AUTO SETTLEMENT =================
  const settlements = useMemo(() => {
    const result = [];
    const [a, b] = memberNamesOnly;

    const balA = balances[a];
    const balB = balances[b];

    if (balA > 0 && balB < 0) {
      result.push({
        from: b,
        to: a,
        amount: Number(Math.abs(balB).toFixed(2)),
      });
    } else if (balB > 0 && balA < 0) {
      result.push({
        from: a,
        to: b,
        amount: Number(Math.abs(balA).toFixed(2)),
      });
    }

    return result;
  }, [balances]);

  // ================= LOGIN =================
  if (!isUnlocked) {
    return (
      <div style={{ padding: 40 }}>
        <h3>পিন দিন</h3>
        <input
          type="password"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
        />
        <button
          onClick={() => {
            if (pinInput === APP_PIN) {
              localStorage.setItem(PIN_STORAGE_KEY, "1");
              setIsUnlocked(true);
            }
          }}
        >
          Login
        </button>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div style={{ padding: 20 }}>
      <h2>হিসাব</h2>

      <form onSubmit={handleAddExpense}>
        <input
          placeholder="Item"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
        />
        <select
          value={selectedBuyer}
          onChange={(e) => setSelectedBuyer(e.target.value)}
        >
          {memberNamesOnly.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button>Add</button>
      </form>

      <h3>Total: ${totalMarketExpense.toFixed(2)}</h3>

      {memberNamesOnly.map((name) => (
        <div key={name}>
          <b>{name}</b> → Balance: ${balances[name].toFixed(2)}
        </div>
      ))}

      <hr />

      {/* 🔥 AUTO SETTLEMENT */}
      <h3>কে কাকে কত দিবে</h3>
      {settlements.length === 0 ? (
        <p>সব হিসাব সমান 👍</p>
      ) : (
        settlements.map((s, i) => (
          <div key={i}>
            👉 <b>{s.from}</b> দিবে <b>{s.to}</b> কে = $
            {s.amount.toFixed(2)}
          </div>
        ))
      )}

      <hr />

      {marketItems.map((item) => (
        <div key={item.id}>
          {item.item} - ${item.amount} ({item.buyer})
          <button onClick={() => handleEditExpense(item)}>Edit</button>
          <button onClick={() => handleDeleteExpense(item.id)}>
            Delete
          </button>

          {editingId === item.id && (
            <div>
              <input
                value={editItemText}
                onChange={(e) => setEditItemText(e.target.value)}
              />
              <input
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              <button onClick={() => handleSaveEdit(item.id)}>
                Save
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}