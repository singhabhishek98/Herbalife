import { Button, Input } from 'antd';

export default function LoginPage({ authForm, setAuthForm, onSubmit, onSwitchToSignup }) {
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
