import dayjs from 'dayjs';
import { plans, teams } from '../data/catalogData';

export const today = () => dayjs().format('YYYY-MM-DD');
export const formatDate = (date) => (date ? dayjs(date).format('DD MMM YYYY') : '-');
export const currency = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;
export const getPlan = (planId) => plans.find((p) => p.id === Number(planId)) || plans[0];
export const getTeam = (teamId) => teams.find((t) => t.id === Number(teamId));
export const initials = (name = '') => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
export const avatarStyle = (seed = '') => {
  const palette = [
    { background: '#e8f7ee', color: '#167c45' },
    { background: '#eef4ff', color: '#2f5bd1' },
    { background: '#fff3e8', color: '#c96a12' },
    { background: '#f5ecff', color: '#7c3bbd' },
    { background: '#eaf7f7', color: '#0f7b7b' },
    { background: '#fff0f3', color: '#c2255c' },
    { background: '#f3f0ff', color: '#5f3dc4' },
    { background: '#edf6ff', color: '#1864ab' }
  ];
  const value = String(seed).trim().toLowerCase();
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  const paletteIndex = value ? hash % palette.length : 0;
  return palette[paletteIndex];
};
export const memberStatus = (days) => {
  if (days <= 0) return { label: 'Expired', tone: 'red' };
  if (days <= 1) return { label: '1 Day Left', tone: 'orange' };
  if (days <= 5) return { label: `${days} Days Left`, tone: 'orange' };
  return { label: `${days} Days Left`, tone: 'green' };
};
