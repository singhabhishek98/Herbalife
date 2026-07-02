import logo from '../assets/logo.svg';

export default function Logo({ compact = false }) {
  return (
    <div className="logoBox">
      <div className="logoIcon">
        <img src={logo} alt="Herbalife logo" className="logoImage" />
      </div>
      {!compact && (
        <div>
          <div className="logoTitle">Herbalife</div>
          <div className="logoSub">MEMBER DASH</div>
        </div>
      )}
    </div>
  );
}
