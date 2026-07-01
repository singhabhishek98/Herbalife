import { HeartFilled } from '@ant-design/icons';

export default function Logo({ compact = false }) {
  return (
    <div className="logoBox">
      <div className="logoIcon"><HeartFilled /></div>
      {!compact && (
        <div>
          <div className="logoTitle">Herbalife</div>
          <div className="logoSub">MANAGER</div>
        </div>
      )}
    </div>
  );
}
