return (
  <div style={{ padding: 16, maxWidth: 420, margin: "auto", fontFamily: "sans-serif" }}>
    <h2 style={{ textAlign: "center" }}>📊 হিসাব</h2>

    {/* ADD FORM */}
    <form onSubmit={handleAddExpense} style={{ marginBottom: 20 }}>
      <input
        placeholder="পণ্যের নাম"
        value={newItemText}
        onChange={(e) => setNewItemText(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8, border: "1px solid #ddd" }}
      />

      <input
        import mahsinImg from "../MAHSIN.JPEG";
        import jisanImg from "../JISAN.JPEG";
        type="number"
        placeholder="টাকা"
        value={newAmount}
        onChange={(e) => setNewAmount(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8, border: "1px solid #ddd" }}
      />

      <select
        value={selectedBuyer}
        onChange={(e) => setSelectedBuyer(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8 }}
      >
        {memberNamesOnly.map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8 }}
      />

      <button style={{
        width: "100%",
        padding: 12,
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontWeight: "bold"
      }}>
        ➕ Add
      </button>
    </form>

    {/* TOTAL */}
    <div style={{
      background: "#111827",
      color: "white",
      padding: 16,
      borderRadius: 12,
      marginBottom: 16
    }}>
      <h3>Total: ${totalMarketExpense.toFixed(2)}</h3>
    </div>

    {/* BALANCE */}
    <div style={{ marginBottom: 16 }}>
      {memberNamesOnly.map((name) => (
        <div key={name} style={{
          background: "#f3f4f6",
          padding: 10,
          borderRadius: 10,
          marginBottom: 8
        }}>
          <b>{name}</b> → ${balances[name].toFixed(2)}
        </div>
      ))}
    </div>

    {/* SETTLEMENT */}
    <div style={{
      background: "#ecfeff",
      padding: 12,
      borderRadius: 12,
      marginBottom: 16
    }}>
      <h4>কে কাকে কত দিবে</h4>

      {settlements.length === 0 ? (
        <p>সব হিসাব সমান</p>
      ) : (
        settlements.map((s, i) => (
          <p key={i}>
            👉 <b>{s.from}</b> দিবে <b>{s.to}</b> কে = ${s.amount}
          </p>
        ))
      )}
    </div>

    {/* LIST */}
    {marketItems.map((item) => (
      <div key={item.id} style={{
        border: "1px solid #eee",
        padding: 10,
        borderRadius: 10,
        marginBottom: 8
      }}>
        <b>{item.item}</b> - ${item.amount} ({item.buyer})

        <div style={{ marginTop: 6 }}>
          <button onClick={() => handleEditExpense(item)} style={{ marginRight: 6 }}>
            ✏️
          </button>
          <button onClick={() => handleDeleteExpense(item.id)}>
            🗑️
          </button>
        </div>
      </div>
    ))}
  </div>
);
