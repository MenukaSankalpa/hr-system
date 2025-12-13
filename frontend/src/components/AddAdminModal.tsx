import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";

const AddAdminModal = ({ close, onCreate }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const res = await fetch("http://localhost:4000/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      onCreate();
      close();
    } else {
      alert("Failed: " + data.message);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h2 style={styles.title}>Add New Admin</h2>

        <div style={styles.field}>
          <FaUser />
          <input
            placeholder="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div style={styles.field}>
          <FaEnvelope />
          <input
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div style={styles.field}>
          <FaUserShield />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">Select Role</option>
            <option value="Super Admin">Super Admin</option>
            <option value="HR Admin">HR Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        <div style={styles.field}>
          <FaLock />
          <input
            placeholder="Password"
            name="password"
            value={form.password}
            type="password"
            onChange={handleChange}
          />
        </div>

        <div style={styles.field}>
          <FaLock />
          <input
            placeholder="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            type="password"
            onChange={handleChange}
          />
        </div>

        <button style={styles.btn} onClick={submit}>
          Create Admin
        </button>
        <button style={styles.closeBtn} onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddAdminModal;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    background: "#fff",
    width: "400px",
    padding: "25px",
    borderRadius: "12px",
  },
  title: { textAlign: "center", marginBottom: "20px" },
  field: {
    display: "flex",
    alignItems: "center",
    background: "#f3f3f3",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
    gap: "10px",
  },
  select: {
    width: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
  },
  btn: {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    marginTop: "10px",
  },
  closeBtn: {
    width: "100%",
    padding: "10px",
    background: "#ccc",
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
  },
};
