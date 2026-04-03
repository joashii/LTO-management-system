import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', age: '' });

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:5000/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addUser = async () => {
    if (!form.name || !form.age) return;

    await fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setForm({ name: '', age: '' });
    fetchUsers();
  };

  return (
    <div className="container">
      <div className="card">
        <h1>User Management</h1>

        <div className="form">
          <input
            name="name"
            placeholder="Enter name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="age"
            placeholder="Enter age"
            value={form.age}
            onChange={handleChange}
          />
          <button onClick={addUser}>Add User</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;