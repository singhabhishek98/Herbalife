import { Button, Input } from 'antd';
import Logo from '../../components/Logo';

export default function LoginPage({ authForm, setAuthForm, onSubmit, onSwitchToSignup }) {
  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <Logo />
          <p className="authIntro">Welcome back. Sign in to continue.</p>
        </div>

        <form className="authForm" onSubmit={onSubmit}>
          <Input
            placeholder="Email address"
            type="email"
            value={authForm.email}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input.Password
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Button type="primary" htmlType="submit" block>Login</Button>
        </form>

        <div className="authForgotLink">
          <button type="button">Forgot Password?</button>
        </div>

        <p className="authHint">
          New here?
          <button type="button" onClick={onSwitchToSignup}>Create account</button>
        </p>
      </div>
    </div>
  );
}
