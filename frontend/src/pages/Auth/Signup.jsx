import { Button, Input } from 'antd';
import Logo from '../../components/Logo';

export default function SignupPage({ authForm, setAuthForm, onSubmit, onSwitchToLogin }) {
  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <Logo />
          <p className="authIntro">Create a new account to get started.</p>
        </div>

        <form className="authForm" onSubmit={onSubmit}>
          <Input
            placeholder="Full name"
            value={authForm.name}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
          />
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
          <Button type="primary" htmlType="submit" block>Create Account</Button>
        </form>

        <p className="authHint">
          Already have an account?
          <button type="button" onClick={onSwitchToLogin}>Login instead</button>
        </p>
      </div>
    </div>
  );
}
