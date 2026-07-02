import { Button, Input, message } from 'antd';
import { useState } from 'react';
import Logo from '../../components/Logo';

export default function ForgotPasswordPage({ onBackToLogin, onSubmitEmail, loading }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (step === 1) {
      if (!email) {
        return message.warning('Please enter your email address');
      }

      if (onSubmitEmail?.sendOtp) {
        const ok = await onSubmitEmail.sendOtp(email);
        if (!ok) return;
      } else {
        message.success(`Password reset OTP sent to ${email}`);
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!otp) {
        return message.warning('Please enter the OTP');
      }

      if (onSubmitEmail?.verifyOtp) {
        const ok = await onSubmitEmail.verifyOtp(email, otp);
        if (!ok) return;
      } else {
        message.success('OTP verified successfully');
      }

      setStep(3);
      return;
    }

    if (!password) {
      return message.warning('Please enter your new password');
    }

    if (password.length < 6) {
      return message.warning('Password must be at least 6 characters long');
    }

    if (!confirmPassword) {
      return message.warning('Please confirm your new password');
    }

    if (password !== confirmPassword) {
      return message.warning('Passwords do not match');
    }

    if (onSubmitEmail?.resetPassword) {
      const ok = await onSubmitEmail.resetPassword(email, otp, password);
      if (!ok) return;
    } else {
      message.success(`Password reset completed for ${email}`);
    }

    setEmail('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setStep(1);
    onBackToLogin();
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <Logo />
          <div className="authBadge">Password Recovery</div>
          <p className="authIntro">
            {step === 1 && 'Enter your email and we’ll send you a password reset OTP.'}
            {step === 2 && 'Enter the 6-digit OTP sent to your email.'}
            {step === 3 && 'Set your new password and return to login.'}
          </p>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <Input placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={step !== 1} />
          {step === 2 && (
            <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
          )}
          {step === 3 && (
            <>
              <Input.Password placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Input.Password placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </>
          )}
          <Button type="primary" htmlType="submit" block loading={loading} className="resetPrimaryButton">
            {step === 1 && 'Send OTP'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'Reset Password'}
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
