// Issue tracking system constants

export const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing', icon: '🚿', description: 'Leaks, drainage, water supply issues' },
  { value: 'electrical', label: 'Electrical', icon: '⚡', description: 'Power, outlets, lighting issues' },
  { value: 'cleanliness', label: 'Cleanliness', icon: '🧹', description: 'Sanitation, garbage, pest control' },
  { value: 'internet', label: 'Internet/WiFi', icon: '📶', description: 'Network connectivity issues' },
  { value: 'furniture', label: 'Furniture', icon: '🪑', description: 'Beds, desks, chairs, wardrobes' },
  { value: 'security', label: 'Security', icon: '🔒', description: 'Locks, doors, access issues' },
  { value: 'other', label: 'Other', icon: '📝', description: 'Any other issues' },
] as const;

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'success', description: 'Can wait a few days' },
  { value: 'medium', label: 'Medium', color: 'primary', description: 'Should be fixed soon' },
  { value: 'high', label: 'High', color: 'warning', description: 'Urgent attention needed' },
  { value: 'emergency', label: 'Emergency', color: 'destructive', description: 'Immediate action required' },
] as const;

export const STATUSES = [
  { value: 'reported', label: 'Reported', color: 'primary' },
  { value: 'assigned', label: 'Assigned', color: 'secondary' },
  { value: 'in-progress', label: 'In Progress', color: 'accent' },
  { value: 'resolved', label: 'Resolved', color: 'success' },
  { value: 'closed', label: 'Closed', color: 'muted' },
] as const;

export const HOSTELS = [
  { value: 'boys-hostel-a', label: 'Boys Hostel A' },
  { value: 'boys-hostel-b', label: 'Boys Hostel B' },
  { value: 'girls-hostel-a', label: 'Girls Hostel A' },
  { value: 'girls-hostel-b', label: 'Girls Hostel B' },
] as const;

export const BLOCKS = ['A', 'B', 'C', 'D', 'E'] as const;

export const ROLES = ['student', 'management', 'warden', 'maintenance'] as const;

// Caretaker/Staff for issue assignment
export const CARETAKERS = [
  { id: 'care-1', name: 'John Plumber', specialty: 'plumbing', hostel: 'Boys Hostel A' },
  { id: 'care-2', name: 'Mike Electrician', specialty: 'electrical', hostel: 'Boys Hostel A' },
  { id: 'care-3', name: 'Sarah Cleaner', specialty: 'cleanliness', hostel: 'Girls Hostel A' },
  { id: 'care-4', name: 'IT Support Team', specialty: 'internet', hostel: 'All' },
  { id: 'care-5', name: 'Furniture Repair', specialty: 'furniture', hostel: 'All' },
  { id: 'care-6', name: 'Security Team', specialty: 'security', hostel: 'All' },
] as const;

export type Category = typeof CATEGORIES[number]['value'];
export type Priority = typeof PRIORITIES[number]['value'];
export type Status = typeof STATUSES[number]['value'];
export type Role = typeof ROLES[number];
