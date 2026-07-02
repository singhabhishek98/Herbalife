import { Button, Input, message } from 'antd';
import { useState } from 'react';

export default function ForgotPasswordPage({ onBackToLogin, onSubmitEmail, loading }) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      return message.warning('Please enter your email address');
    }

    if (onSubmitEmail) {
      await onSubmitEmail(email);
    } else {
      message.success(`Password reset link sent to ${email}`);
    }

    setEmail('');
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <div className="logoBox">
            <div className="logoIcon"><span style={{ fontSize: 22 }}>🌿</span></div>
            <div>
              <div className="logoTitle">Herbalife</div>
              <div className="logoSub">MEMBER DASH</div>
            </div>
          </div>
          <div className="authBadge">Password Recovery</div>
          <p className="authIntro">Enter your email and we’ll send you a password reset link.</p>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <Input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="primary" htmlType="submit" block loading={loading} className="resetPrimaryButton">
            Send Reset Link
          </Button>
        </form>

        <div className="forgotActions">
          <button type="button" className="forgotBackButton" onClick={onBackToLogin}>
            Back to login
          </button>
          <p className="forgotHelperText">Use the same email you used while signing up.</p>
        </div>
      </div>
    </div>
  );
}
