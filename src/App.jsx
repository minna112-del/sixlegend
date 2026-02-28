import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  query, deleteDoc, doc 
} from 'firebase/firestore';

// ================= FIREBASE CONFIG =================
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "dummy-key",
  authDomain: "dummy.firebaseapp.com",
  projectId: "dummy-project"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'lillahi-orphanage-app';

// ================= DATA =================
const members = [
  { name: "শায়েখ সাহাব উদ্দিন সাহেব", img: "সাহাব উদ্দিন.jpeg" },
  { name: "হাফেজ মহসিন সাহেব", img: "মহসিন.jpeg" },
  { name: "মাওলানা রায়হান সাহেব", img: "রায়হান মির্জা.jpeg" },
  { name: "মাওলানা আবদুল সাত্তার সাহেব", img: "আবদুল সাত্তার.jpeg" },
  { name: "আলহাজ্ব বাপ্পি মোল্লা", img: "বাদশা.jpeg" },
  { name: "মাওলানা ইমরান সাহেব", img: "ইমরান ভুঁইয়া.png" }
];

const memberNamesOnly = members.map(m => m.name);

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
const dayNames = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

const convertToBanglaNumber = (number) => {
  const banglaNumbers = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return number.toString().replace(/[0-9]/g, x => banglaNumbers[x]);
};

// ================= REACT APP =================
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [today, setToday] = useState(new Date());
  const [user, setUser] = useState(null);

  // Market state
  const [marketItems, setMarketItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(memberNamesOnly[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isLoading, setIsLoading] = useState(true);

  const whatsappLink = "https://chat.whatsapp.com/C8dEbHfrmKfERqSGDxreuK?mode=gi_t";

  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

    const initAuth = async () => {
      try { await signInAnonymously(auth); } 
      catch(e){ console.error("Auth error:", e); }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => { setUser(user); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const marketRef = collection(db, 'artifacts', appId, 'public', 'data', 'market_items');
    const q = query(marketRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => b.timestamp - a.timestamp);
      setMarketItems(items);
      setIsLoading(false);
    }, (error) => { console.error(error); setIsLoading(false); });

    return () => unsubscribe();
  }, [user]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!user || !newItemText.trim() || !newAmount) return;
    try {
      const marketRef = collection(db, 'artifacts', appId, 'public', 'data', 'market_items');
      await addDoc(marketRef, {
        item: newItemText,
        amount: Number(newAmount),
        buyer: selectedBuyer,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        month: new Date().getMonth()
      });
      setNewItemText(''); setNewAmount('');
    } catch(e){ console.error(e); alert("খরচ যোগ করতে সমস্যা হয়েছে।"); }
  };

  const handleDeleteExpense = async (id) => {
    if (!user || !window.confirm("আপনি কি নিশ্চিত এই খরচটি মুছে ফেলতে চান?")) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'market_items', id)); }
    catch(e){ console.error(e); }
  };

  const activeMonthItems = marketItems.filter(item => {
    const itemMonth = item.month !== undefined ? item.month : new Date(item.date).getMonth();
    return itemMonth === selectedMonth;
  });

  const totalExpense = activeMonthItems.reduce((sum, item) => sum + item.amount, 0);
  const perPersonCost = totalExpense / memberNamesOnly.length;

  const getMemberExpense = (memberName) => activeMonthItems
    .filter(item => item.buyer === memberName)
    .reduce((sum, item) => sum + item.amount, 0);

  // ================= SIMPLE HOME VIEW =================
  return (
    <div style={{padding: "2rem", fontFamily: "sans-serif"}}>
      <h1>লিল্লাহি এতিমখানা</h1>
      <p>{convertToBanglaNumber(today.getDate())} {monthNames[today.getMonth()]}, {convertToBanglaNumber(today.getFullYear())}</p>

      <h2>আজকের শেফ: {memberNamesOnly[getCookIndex(today)]}</h2>
      <h2>আজকের ক্লিনার: {memberNamesOnly[getCleanerIndex(today)]}</h2>

      <form onSubmit={handleAddExpense}>
        <input type="text" placeholder="নতুন বাজার" value={newItemText} onChange={(e)=>setNewItemText(e.target.value)} required />
        <input type="number" placeholder="টাকা" value={newAmount} onChange={(e)=>setNewAmount(e.target.value)} required />
        <select value={selectedBuyer} onChange={(e)=>setSelectedBuyer(e.target.value)}>
          {memberNamesOnly.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        <button type="submit">যুক্ত করুন</button>
      </form>

      <h3>মোট খরচ: ৳{convertToBanglaNumber(totalExpense)}</h3>
      <h3>জনপ্রতি খরচ: ৳{convertToBanglaNumber(Math.round(perPersonCost))}</h3>

      <div>
        {activeMonthItems.map(item => (
          <div key={item.id}>
            {item.item} - ৳{convertToBanglaNumber(item.amount)} ({item.buyer}) 
            <button onClick={()=>handleDeleteExpense(item.id)}>মুছুন</button>
          </div>
        ))}
      </div>

      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp গ্রুপে যুক্ত হোন</a>
    </div>
  );
}
