import dayjs from 'dayjs';
import { plans, teams } from '../data/catalogData';

export const today = () => dayjs().format('YYYY-MM-DD');
export const formatDate = (date) => (date ? dayjs(date).format('DD MMM YYYY') : '-');
export const currency = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;
export const getPlan = (planId) => plans.find((p) => p.id === Number(planId)) || plans[0];
export const getTeam = (teamId) => teams.find((t) => t.id === Number(teamId));
export const initials = (name = '') => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
export const memberStatus = (days) => {
  if (days <= 0) return { label: 'Expired', tone: 'red' };
  if (days <= 1) return { label: '1 Day Left', tone: 'orange' };
  if (days <= 5) return { label: `${days} Days Left`, tone: 'orange' };
  return { label: `${days} Days Left`, tone: 'green' };
};
