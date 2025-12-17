import React, { useEffect, useState } from "react";
import AddAdminModal from "../components/AddAdminModal";

// ✅ Use environment variable for API URL
const API = import.meta.env.VITE_API_URL;

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load all admins from backend
  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/admin`, {
        method: "GET",
        credentials: "include", // only if you need cookies
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setAdmins(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Management</h1>

      <button onClick={() => setOpen(true)} style={btn}>
        Add Admin
      </button>

      {open && <AddAdminModal close={() => setOpen(false)} onCreate={loadAdmins} />}

      {loading && <p>Loading admins...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border={1} cellPadding={10} style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((a) => (
            <tr key={a._id}>
              <td>{a.username}</td>
              <td>{a.email}</td>
              <td>{a.role}</td>
              <td>{new Date(a.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const btn: React.CSSProperties = {
  padding: "12px 16px",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default AdminPage;
