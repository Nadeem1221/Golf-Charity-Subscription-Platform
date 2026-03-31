import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 2-step form
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedCharity: '',
    charityContributionPercent: 10,
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/charities?limit=50').then(({ data }) => {
      if (data.success) setCharities(data.charities);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!form.name.trim())             return 'Name is required';
    if (!form.email.trim())            return 'Email is required';
    if (form.password.length < 6)      return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.charityContributionPercent < 10) {
      setError('Minimum charity contribution is 10%');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        selectedCharity: form.selectedCharity || undefined,
        charityContributionPercent: Number(form.charityContributionPercent),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1>Create Account</h1>
        <p className="auth-sub">
          Step {step} of 2 — {step === 1 ? 'Your Details' : 'Choose Your Charity'}
        </p>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Step 1: Account details ─────────────────────────── */}
        {step === 1 && (
          <div className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                value={form.name} onChange={handleChange}
                placeholder="John Smith" required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password"
                value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat password" required
              />
            </div>
            <button type="button" className="btn-primary btn-full" onClick={handleNext}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Charity selection ───────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="selectedCharity">Choose a Charity (optional)</label>
              <select
                id="selectedCharity" name="selectedCharity"
                value={form.selectedCharity} onChange={handleChange}
              >
                <option value="">-- Select a charity --</option>
                {charities.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <small>You can change this later from your dashboard.</small>
            </div>

            <div className="form-group">
              <label htmlFor="charityContributionPercent">
                Charity Contribution: {form.charityContributionPercent}%
              </label>
              <input
                id="charityContributionPercent"
                name="charityContributionPercent"
                type="range" min="10" max="100"
                value={form.charityContributionPercent}
                onChange={handleChange}
              />
              <small>Minimum 10% of your subscription goes to charity</small>
            </div>

            <div className="form-row">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
