import { useState, useEffect } from "react";
import { auth, db } from "./firebase/config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [user, setUser] = useState(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [amount, setAmount] = useState("");
  const [contributions, setContributions] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [members, setMembers] = useState([]);

  const fetchMembers = async () => {
    const querySnapshot = await getDocs(collection(db, "members"));
    const membersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMembers(membersList);
  };

  const fetchContributions = async () => {
    const querySnapshot = await getDocs(collection(db, "contributions"));
    const contributionsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setContributions(contributionsList);
  };

  useEffect(() => {
    fetchMembers();
    fetchContributions();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      await setDoc(doc(db, "users", String(loggedInUser.uid)), {
        name: loggedInUser.displayName,
        email: loggedInUser.email,
        uid: loggedInUser.uid,
      });

      setUser(loggedInUser);
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const addMember = async () => {
    if (!memberName || !memberEmail) {
      alert("Please fill in both name and email");
      return;
    }

    try {
      await setDoc(doc(db, "members", Date.now().toString()), {
        name: memberName,
        email: memberEmail,
        createdAt: new Date().toISOString(),
      });

      alert("Member added!");
      setMemberName("");
      setMemberEmail("");
      fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      alert(error.message);
    }
  };

  const addContribution = async () => {
    if (!selectedMember || !amount) {
      alert("Please select a member and enter amount");
      return;
    }

    try {
      await addDoc(collection(db, "contributions"), {
        memberName: selectedMember,
        amount: Number(amount),
        createdAt: new Date().toISOString(),
      });

      alert("Contribution saved!");
      setSelectedMember("");
      setAmount("");
      fetchContributions();
    } catch (error) {
      console.error("Error adding contribution:", error);
      alert(error.message);
    }
  };

  const deleteMember = async (id) => {
    try {
      await deleteDoc(doc(db, "members", id));
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const deleteContribution = async (id) => {
    try {
      await deleteDoc(doc(db, "contributions", id));
      fetchContributions();
    } catch (error) {
      console.error("Error deleting contribution:", error);
    }
  };

  const totalContributions = contributions.reduce(
      (sum, contribution) => sum + Number(contribution.amount || 0),
      0
  );

  const memberTotals = members.map((member) => {
    const total = contributions
        .filter((contribution) => contribution.memberName === member.name)
        .reduce(
            (sum, contribution) => sum + Number(contribution.amount || 0),
            0
        );

    return {
      ...member,
      total,
    };
  });

  const chartData = memberTotals.map((m) => ({
    name: m.name,
    total: m.total,
  }));

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)",
      color: "#e2e8f0",
      padding: "40px 20px",
      fontFamily: "Inter, Arial, sans-serif",
    },
    loginWrap: {
      minHeight: "80vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    loginCard: {
      width: "100%",
      maxWidth: "430px",
      background: "rgba(15, 23, 42, 0.75)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      borderRadius: "22px",
      padding: "34px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      textAlign: "center",
    },
    dashboard: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "24px",
    },
    title: {
      margin: 0,
      fontSize: "44px",
      fontWeight: "900",
      background: "linear-gradient(135deg, #38bdf8, #6366f1)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      margin: "8px 0 0",
      color: "#cbd5e1",
      fontSize: "16px",
    },
    logoutBtn: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "12px 18px",
      cursor: "pointer",
      fontWeight: "700",
      boxShadow: "0 0 10px rgba(239,68,68,0.4)",
      transition: "all 0.3s ease",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "18px",
      marginBottom: "26px",
    },
    statCard: {
      background: "rgba(15, 23, 42, 0.7)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      borderRadius: "20px",
      padding: "22px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    },
    statLabel: {
      color: "#94a3b8",
      fontSize: "14px",
      marginBottom: "10px",
    },
    statValue: {
      fontSize: "32px",
      fontWeight: "800",
      color: "#f8fafc",
    },
    chartCard: {
      background: "rgba(15, 23, 42, 0.7)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      borderRadius: "20px",
      padding: "22px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      marginBottom: "26px",
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },
    card: {
      background: "rgba(15, 23, 42, 0.7)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      borderRadius: "20px",
      padding: "22px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    },
    cardTitle: {
      fontSize: "24px",
      fontWeight: "800",
      margin: "0 0 18px",
      color: "#f8fafc",
      textAlign: "center",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "14px",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1px solid #334155",
      background: "#020617",
      color: "#e2e8f0",
      outline: "none",
      boxSizing: "border-box",
    },
    primaryBtn: {
      background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      padding: "12px 16px",
      cursor: "pointer",
      fontWeight: "700",
      transition: "all 0.3s ease",
      boxShadow: "0 0 15px rgba(59,130,246,0.4)",
    },
    list: {
      marginTop: "18px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    item: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      background: "#0b1220",
      border: "1px solid rgba(148, 163, 184, 0.14)",
      borderRadius: "14px",
      padding: "14px",
      flexWrap: "wrap",
    },
    itemMain: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    itemTitle: {
      fontWeight: "700",
      color: "#f8fafc",
    },
    itemSub: {
      color: "#94a3b8",
      fontSize: "14px",
    },
    itemRight: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
    },
    totalBadge: {
      background: "linear-gradient(135deg, #22c55e, #16a34a)",
      color: "#ecfdf5",
      borderRadius: "999px",
      padding: "8px 12px",
      fontWeight: "700",
      fontSize: "14px",
    },
    deleteBtn: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "10px 14px",
      cursor: "pointer",
      fontWeight: "700",
      boxShadow: "0 0 10px rgba(239,68,68,0.4)",
      transition: "all 0.3s ease",
    },
    empty: {
      color: "#94a3b8",
      textAlign: "center",
      padding: "14px 0",
    },
  };

  const hoverIn = (e) => {
    e.target.style.transform = "scale(1.05)";
  };

  const hoverOut = (e) => {
    e.target.style.transform = "scale(1)";
  };

  return (
      <div style={styles.page}>
        {!user ? (
            <div style={styles.loginWrap}>
              <div style={styles.loginCard}>
                <h1 style={{ ...styles.title, fontSize: "38px", marginBottom: "8px" }}>
                  SACCO APP
                </h1>
                <p style={{ ...styles.subtitle, marginBottom: "24px" }}>
                  Secure member and contribution management
                </p>
                <button
                    style={styles.primaryBtn}
                    onClick={login}
                    onMouseOver={hoverIn}
                    onMouseOut={hoverOut}
                >
                  Login with Google
                </button>
              </div>
            </div>
        ) : (
            <div style={styles.dashboard}>
              <div style={styles.header}>
                <div>
                  <h1 style={styles.title}>SACCO Dashboard</h1>
                  <p style={styles.subtitle}>
                    Welcome, {user.displayName} • {user.email}
                  </p>
                </div>
                <button
                    style={styles.logoutBtn}
                    onClick={logout}
                    onMouseOver={hoverIn}
                    onMouseOut={hoverOut}
                >
                  Logout
                </button>
              </div>

              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Members</div>
                  <div style={styles.statValue}>{members.length}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Contributions</div>
                  <div style={styles.statValue}>${totalContributions}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Transactions</div>
                  <div style={styles.statValue}>{contributions.length}</div>
                </div>
              </div>

              <div style={styles.chartCard}>
                <h2 style={styles.cardTitle}>Contributions Overview</h2>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.contentGrid}>
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Members</h2>

                  <div style={styles.formRow}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Member name"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                    />
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Member email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                    />
                  </div>

                  <button
                      style={styles.primaryBtn}
                      onClick={addMember}
                      onMouseOver={hoverIn}
                      onMouseOut={hoverOut}
                  >
                    Save Member
                  </button>

                  <div style={styles.list}>
                    {memberTotals.length === 0 ? (
                        <p style={styles.empty}>No members yet</p>
                    ) : (
                        memberTotals.map((member) => (
                            <div key={member.id} style={styles.item}>
                              <div style={styles.itemMain}>
                                <div style={styles.itemTitle}>{member.name}</div>
                                <div style={styles.itemSub}>{member.email}</div>
                              </div>

                              <div style={styles.itemRight}>
                        <span style={styles.totalBadge}>
                          Total: ${member.total}
                        </span>
                                <button
                                    style={styles.deleteBtn}
                                    onClick={() => deleteMember(member.id)}
                                    onMouseOver={hoverIn}
                                    onMouseOut={hoverOut}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </div>

                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Contributions</h2>

                  <div style={styles.formRow}>
                    <select
                        style={styles.input}
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                    >
                      <option value="">Select member</option>
                      {members.map((member) => (
                          <option key={member.id} value={member.name}>
                            {member.name}
                          </option>
                      ))}
                    </select>

                    <input
                        style={styles.input}
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <button
                      style={styles.primaryBtn}
                      onClick={addContribution}
                      onMouseOver={hoverIn}
                      onMouseOut={hoverOut}
                  >
                    Save Contribution
                  </button>

                  <div style={styles.list}>
                    {contributions.length === 0 ? (
                        <p style={styles.empty}>No contributions yet</p>
                    ) : (
                        contributions.map((contribution) => (
                            <div key={contribution.id} style={styles.item}>
                              <div style={styles.itemMain}>
                                <div style={styles.itemTitle}>
                                  {contribution.memberName}
                                </div>
                                <div style={styles.itemSub}>
                                  Amount: ${contribution.amount}
                                </div>
                              </div>

                              <div style={styles.itemRight}>
                                <button
                                    style={styles.deleteBtn}
                                    onClick={() => deleteContribution(contribution.id)}
                                    onMouseOver={hoverIn}
                                    onMouseOut={hoverOut}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;