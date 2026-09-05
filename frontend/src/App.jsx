import React, { useState, useEffect } from 'react';

const API_BASE = "http://localhost:5000/api";

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken('');
    setTasks([]);
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, priority })
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([data, ...tasks]);
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (res.ok) setTasks(tasks.map(t => (t._id === id ? data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {!user ? (
        <div style={{ border: '1px solid #ddd', padding: '24px', borderRadius: '8px' }}>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          {authError && <p style={{ color: 'red' }}>{authError}</p>}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!isLogin && (
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px' }} />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '8px' }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '8px' }} />
            <button type="submit" style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {isLogin ? 'Log In' : 'Register'}
            </button>
          </form>
          <p style={{ marginTop: '12px' }}>
            {isLogin ? "Need an account? " : "Already registered? "}
            <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Hello, {user.name}</h2>
            <button onClick={logout} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>

          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <h3>Create a New Task</h3>
            <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '8px' }} />
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '8px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ padding: '8px' }}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button type="submit" style={{ flex: 1, padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Add Task
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3>Your Tasks</h3>
            {tasks.map(task => (
              <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: task.status === 'completed' ? '#f1f5f9' : '#fff' }}>
                <div>
                  <h4 style={{ margin: 0, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h4>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{task.description}</p>
                  <small>Priority: <strong>{task.priority}</strong></small>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => updateStatus(task._id, task.status)} style={{ padding: '6px 10px', background: task.status === 'completed' ? '#f59e0b' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {task.status === 'completed' ? 'Undo' : 'Complete'}
                  </button>
                  <button onClick={() => deleteTask(task._id)} style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}