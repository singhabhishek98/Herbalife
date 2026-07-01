export const plans = [
  { id: 1, name: '1 Day', days: 1, pricePerDay: 250, total: 250 },
  { id: 2, name: '5 Days', days: 5, pricePerDay: 240, total: 1200 },
  { id: 3, name: '12 Days', days: 12, pricePerDay: 230, total: 2760 },
  { id: 4, name: '25 Days', days: 25, pricePerDay: 220, total: 5500 }
];

export const teams = [
  { id: 1, name: 'Manish Team', head: 'Manish', phone: '9876543210', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face' },
  { id: 2, name: 'Abhishek Team', head: 'Abhishek', phone: '9876543211', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=face' },
  { id: 3, name: 'Aditya Team', head: 'Aditya', phone: '9876543212', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&h=160&fit=crop&crop=face' }
];

export const initialMembers = [
  { id: 101, name: 'Rahul Kumar', mobile: '9000011111', teamId: 1, planId: 3, startDate: '2026-06-25', remainingDays: 5, lastVisit: '2026-07-01', paymentStatus: 'Paid', notes: 'Morning batch', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face' },
  { id: 102, name: 'Priya Singh', mobile: '9000022222', teamId: 1, planId: 2, startDate: '2026-06-30', remainingDays: 1, lastVisit: '2026-07-02', paymentStatus: 'Paid', notes: 'Evening batch', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face' },
  { id: 103, name: 'Saurabh Mehta', mobile: '9000033333', teamId: 1, planId: 4, startDate: '2026-06-20', remainingDays: 15, lastVisit: '2026-07-02', paymentStatus: 'Paid', notes: '', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=160&h=160&fit=crop&crop=face' },
  { id: 104, name: 'Neha Sharma', mobile: '9000044444', teamId: 1, planId: 3, startDate: '2026-06-18', remainingDays: 0, lastVisit: '2026-07-02', paymentStatus: 'Pending', notes: 'Renew follow-up', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face' },
  { id: 105, name: 'Vikash Yadav', mobile: '9000055555', teamId: 2, planId: 3, startDate: '2026-06-23', remainingDays: 3, lastVisit: '2026-07-01', paymentStatus: 'Paid', notes: '', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face' },
  { id: 106, name: 'Aman Mishra', mobile: '9000066666', teamId: 3, planId: 1, startDate: '2026-07-01', remainingDays: 0, lastVisit: '2026-07-01', paymentStatus: 'Paid', notes: '', avatar: '' }
];
