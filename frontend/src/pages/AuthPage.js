import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = isLogin
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          )}
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="toggle-auth">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}
