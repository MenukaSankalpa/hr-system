import React, { useEffect, useState } from "react";
import AddAdminModal from "../components/AddAdminModal";

const AdminPage = () => {
  const [admins, setAdmins] = useState([]);
  const [open, setOpen] = useState(false);

  const loadAdmins = async () => {
    const res = await fetch("http://localhost:4000/api/admins");
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setOpen(true)} style={btn}>
        Add Admin
      </button>

      {open && (
        <AddAdminModal close={() => setOpen(false)} onCreate={loadAdmins} />
      )}

      <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((a) => (
            <tr key={a._id}>
              <td>{a.name}</td>
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

const btn = {
  padding: "12px 16px",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
};

export default AdminPage;
