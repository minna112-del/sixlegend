// ================= UI =================
return (
  <div style={{ 
    padding: 16, 
    maxWidth: 420, 
    margin: "auto", 
    fontFamily: "sans-serif",
    background: "#f9fafb",
    minHeight: "100vh"
  }}>

    <h2 style={{ textAlign: "center", marginBottom: 24 }}>📊 হিসাব</h2>

    {/* ADD FORM - তোমার আগের ফর্ম রাখতে পারো, অথবা আমার আগের উন্নত ভার্সন ব্যবহার করো */}

    {/* TOTAL */}
    <div style={{
      background: "#111827",
      color: "white",
      padding: 20,
      borderRadius: 16,
      marginBottom: 20,
      textAlign: "center"
    }}>
      <h3 style={{ margin: 0 }}>মোট খরচ: ৳{totalMarketExpense.toFixed(2)}</h3>
    </div>

    {/* BALANCES with Avatar */}
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ marginBottom: 12, color: "#374151" }}>প্রত্যেকের হিসাব:</h4>
      
      {memberNamesOnly.map((name) => {
        const avatarSrc = name === "মহসিন" ? "/MAHSIN.JPEG" : "/JISAN.JPEG";
        
        return (
          <div key={name} style={{
            background: "#ffffff",
            padding: 16,
            borderRadius: 16,
            marginBottom: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 16
          }}>
            {/* Avatar */}
            <img 
              src={avatarSrc}
              alt={name}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #2563eb"
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/60?text=" + name[0]; // fallback
              }}
            />

            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 18, display: "block" }}>{name}</b>
              <span style={{
                fontSize: 17,
                fontWeight: "bold",
                color: balances[name] >= 0 ? "#10b981" : "#ef4444"
              }}>
                ৳{balances[name].toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>

    {/* SETTLEMENT */}
    <div style={{
      background: "#ecfeff",
      padding: 20,
      borderRadius: 16,
      marginBottom: 24,
      border: "1px solid #67e8f9"
    }}>
      <h4 style={{ marginBottom: 12 }}>কে কাকে কত দিবে</h4>
      {settlements.length === 0 ? (
        <p style={{ color: "#0e7490", fontWeight: "500" }}>🎉 সব হিসাব সমান!</p>
      ) : (
        settlements.map((s, i) => (
          <p key={i} style={{ margin: "12px 0", fontSize: 16.5 }}>
            👉 <b>{s.from}</b> দিবে <b>{s.to}</b> কে <b>৳{s.amount.toFixed(2)}</b>
          </p>
        ))
      )}
    </div>

    {/* EXPENSE LIST - তোমার আগের লিস্ট রাখতে পারো বা আরও সুন্দর করতে পারো */}

    {marketItems.map((item) => (
      <div key={item.id} style={{
        border: "1px solid #e5e7eb",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        background: "white"
      }}>
        <b>{item.item}</b> — ৳{item.amount} ({item.buyer})
        {/* Edit & Delete buttons... */}
      </div>
    ))}

  </div>
);
