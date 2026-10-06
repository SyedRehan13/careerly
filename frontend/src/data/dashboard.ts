export const summaryMetrics = [
  { label: 'Active Applications', value: '12', change: '+3 this week', tone: 'indigo' },
  { label: 'Interviews', value: '3', change: '2 upcoming', tone: 'violet' },
  { label: 'Saved Jobs', value: '8', change: '4 new matches', tone: 'amber' },
  { label: 'Response Rate', value: '24%', change: '+6% this month', tone: 'emerald' },
] as const

export const recentApplications = [
  { company: 'Linear', role: 'Product Designer', status: 'Interview', date: 'Oct 5', initials: 'LI' },
  { company: 'Vercel', role: 'Frontend Engineer', status: 'Applied', date: 'Oct 3', initials: 'VE' },
  { company: 'Notion', role: 'Product Engineer', status: 'Review', date: 'Sep 30', initials: 'NO' },
] as const

export const upcomingInterviews = [
  { company: 'Linear', type: 'Portfolio review', time: 'Tomorrow · 10:30 AM' },
  { company: 'Arc', type: 'Hiring manager call', time: 'Fri, Oct 9 · 2:00 PM' },
] as const

