import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useMutation } from '../hooks/useAsync';
import './AuthPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, mutate } = useMutation(login);

  const redirectTo = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    await mutate({ email, password });
    navigate(redirectTo, { replace: true });
  }

  return (
    <main className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <Link to="/" className="auth-form__logo">
          Grub<em>buds</em>
        </Link>
        <h1 className="auth-form__title">Welcome back</h1>
        <p className="auth-form__subtitle">Log in to keep track of your spots.</p>

        <label className="auth-form__field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            autoFocus
          />
        </label>

        <label className="auth-form__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="auth-form__error">{error.message}</p>}

        <Button type="submit" variant="primary" size="lg" disabled={loading} className="auth-form__submit">
          {loading ? 'Logging in...' : 'Log in'}
        </Button>

        <p className="auth-form__switch">
          New to Grubbuds? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
