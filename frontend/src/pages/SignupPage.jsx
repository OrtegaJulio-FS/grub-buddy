import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useMutation } from '../hooks/useAsync';
import './AuthPage.css';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, mutate } = useMutation(signup);

  async function handleSubmit(e) {
    e.preventDefault();
    await mutate({ name, email, password });
    navigate('/', { replace: true });
  }

  return (
    <main className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <Link to="/" className="auth-form__logo">
          Grub<em>buds</em>
        </Link>
        <h1 className="auth-form__title">Join Grubbuds</h1>
        <p className="auth-form__subtitle">Log visits, rate spots, and follow your friends.</p>

        <label className="auth-form__field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            required
            autoFocus
          />
        </label>

        <label className="auth-form__field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-form__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <span className="auth-form__hint">At least 8 characters</span>
        </label>

        {error && <p className="auth-form__error">{error.message}</p>}

        <Button type="submit" variant="primary" size="lg" disabled={loading} className="auth-form__submit">
          {loading ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="auth-form__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
