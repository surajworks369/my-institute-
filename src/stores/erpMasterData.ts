// src/stores/erpMasterData.ts

/**
 * `stores/erpMasterData.ts` (ERP Master Data / Constants)
 *
 * - **Purpose**: Central place for master lists, labels, and constants used across the ERP UI.
 * - **Role in project**: Source for dropdown options, seed data, and defaults in stores and views.
 * - **Logic type**: Constants plus helper builders (batch seeds, receipt numbers, defaults).
 * - **File type**: Store support / constants (frontend)
 *
 * Note: Master values are hardcoded for now. With a backend/API, this data can be loaded from
 * admin-managed master tables.
 */

export const MASTER_COURSE_NAMES = [
  'Full Stack Development',
  'Data Science',
  'UI/UX Design',
  'Cyber Security',
  'Digital Marketing',
  'Graphic Design',
  'Tally & GST',
  'MS-CIT Advanced',
  'Web Development',
  'Mobile App Development',
  'Python Programming',
  'Video Editing',
] as const

export const MASTER_CITY_LIST = [
  'Kolhapur',
  'Pune',
  'Sangli',
  'Satara',
  'Ratnagiri',
  'Karad',
] as const

export const MASTER_DURATION_OPTIONS = [
  '1 Month',
  '2 Months',
  '3 Months',
  '6 Months',
  '12 Months',
] as const

export const MASTER_TRAINERS = [
  'Amit Sir',
  'Priya Ma’am',
  'Rahul Sir',
  'Sneha Ma’am',
  'Kiran Sir',
  'Pooja Ma’am',
] as const

export const MASTER_BATCH_LABELS = ['Morning', 'Afternoon', 'Evening'] as const

export const MASTER_ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Leave'] as const

export const MASTER_EXAM_TYPES = ['Unit', 'Midterm', 'Final', 'Practical', 'Other'] as const

export const MASTER_EXAM_STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'] as const

export const MASTER_EXAM_NAME_OPTIONS = [
  'Unit Test 1',
  'Unit Test 2',
  'Midterm Assessment',
  'Final Exam',
  'Practical Test',
  'Internal Evaluation',
  'Mock Test',
] as const

// ==============================
// FEES MASTER VALUES
// ==============================

export const MASTER_FEE_STATUSES = ['Pending', 'Partial', 'Paid', 'Overdue'] as const

export const MASTER_PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'] as const

export const MASTER_INSTALLMENT_TYPES = [
  'Full Payment',
  'First Installment',
  'Second Installment',
  'Final Installment',
  'Custom Installment',
] as const

export const MASTER_RECEIPT_PREFIX = 'VBH-FEE'
export const MASTER_PAYMENT_RECEIPT_PREFIX = 'VBH-PAY'

// ==============================
// REPORTS MASTER VALUES
// ==============================

export const MASTER_REPORT_CATEGORIES = [
  'Students',
  'Attendance',
  'Exams',
  'Fees',
  'Staff',
  'Summary',
] as const

export const MASTER_EXPORT_FORMATS = ['CSV', 'Excel', 'JSON', 'Print'] as const

export const MASTER_REPORT_QUICK_FILTERS = [
  'Today',
  'This Week',
  'This Month',
  'This Quarter',
  'This Year',
  'Custom Range',
] as const

export const MASTER_REPORT_CARD_VARIANTS = [
  'Primary',
  'Success',
  'Warning',
  'Danger',
  'Info',
] as const

export const MASTER_REPORT_GROUP_BY_OPTIONS = [
  'Course',
  'Batch',
  'Status',
  'Date',
  'Payment Method',
  'Exam',
] as const

export const MASTER_REPORT_DATE_FIELDS = [
  'Admission Date',
  'Attendance Date',
  'Exam Date',
  'Due Date',
  'Payment Date',
] as const

export const MASTER_REPORT_STATUS_GROUPS = {
  student: ['Active', 'Inactive'],
  attendance: ['Present', 'Absent', 'Late', 'Leave'],
  exam: ['Pass', 'Fail'],
  fees: ['Paid', 'Partial', 'Pending', 'Overdue'],
  staff: ['Active', 'Inactive', 'On Leave'],
} as const

// ==============================
// STAFF MASTER VALUES
// ==============================

// Staff module chya current actual roles sobat aligned
export const MASTER_STAFF_ROLES = [
  'Admin',
  'Teacher',
  'Accountant',
  'Counsellor',
  'Receptionist',
  'Coordinator',
  'Support Staff',
] as const

// Store/UI use-case sobat aligned departments
export const MASTER_STAFF_DEPARTMENTS = [
  'Administration',
  'Academics',
  'Finance',
  'Student Support',
  'Operations',
] as const

export const MASTER_DESIGNATION_OPTIONS = [
  'Senior Teacher',
  'Junior Teacher',
  'Academic Coordinator',
  'Front Desk Executive',
  'Finance Executive',
  'Office Administrator',
  'Support Executive',
] as const

export const MASTER_EMPLOYMENT_STATUSES = ['Active', 'Inactive', 'On Leave'] as const

export const MASTER_STAFF_GENDERS = ['Male', 'Female', 'Other'] as const

export const MASTER_STAFF_QUALIFICATIONS = [
  'B.Com',
  'B.Sc',
  'B.A',
  'M.Com',
  'M.Sc',
  'MBA',
  'B.Ed',
  'M.Ed',
  'BCA',
  'MCA',
] as const

export const MASTER_STAFF_REPORT_FIELDS = [
  'Staff Code',
  'Full Name',
  'Role',
  'Department',
  'Email',
  'Phone',
  'Gender',
  'City',
  'Status',
  'Joining Date',
  'Salary',
] as const

// ==============================
// SETTINGS / ACADEMIC MASTER VALUES
// ==============================

export const MASTER_ACADEMIC_SESSIONS = ['2025-26', '2026-27', '2027-28'] as const

export const MASTER_GRADING_TYPES = ['Percentage', 'Grade', 'Marks'] as const

export const MASTER_ATTENDANCE_RULE_TYPES = ['Daily', 'Lecture-wise', 'Batch-wise'] as const

export const MASTER_SYSTEM_THEMES = ['Default', 'Light', 'Dark'] as const

// ==============================
// BATCH SEED TYPE
// ==============================

export interface MasterBatchSeed {
  name: string
  code: string
  courseName: string
  timing: string
  days: string[]
  trainer: string
  assistantTrainer: string
  classroom: string
  status: 'Active' | 'Inactive'
}

// ==============================
// BATCH SEEDS
// ==============================

export function buildMasterBatchSeeds(): MasterBatchSeed[] {
  const primary = MASTER_COURSE_NAMES.map((courseName, index) => ({
    name: `${courseName} - Morning`,
    code: `BCH-${String(index + 101)}`,
    courseName,
    timing: '08:00 AM - 10:00 AM',
    days: ['Mon', 'Wed', 'Fri'],
    trainer: MASTER_TRAINERS[index % MASTER_TRAINERS.length] ?? 'Amit Sir',
    assistantTrainer: MASTER_TRAINERS[(index + 1) % MASTER_TRAINERS.length] ?? 'Priya Ma’am',
    classroom: `Room-${201 + index}`,
    status: index % 4 === 0 ? ('Inactive' as const) : ('Active' as const),
  }))

  const extra = MASTER_COURSE_NAMES.slice(0, 9).map((courseName, index) => ({
    name: `${courseName} - Evening`,
    code: `BCH-${String(index + 201)}`,
    courseName,
    timing: '06:30 PM - 08:30 PM',
    days: ['Tue', 'Thu', 'Sat'],
    trainer: MASTER_TRAINERS[(index + 2) % MASTER_TRAINERS.length] ?? 'Rahul Sir',
    assistantTrainer: MASTER_TRAINERS[(index + 3) % MASTER_TRAINERS.length] ?? 'Sneha Ma’am',
    classroom: `Lab-${index + 1}`,
    status: index % 5 === 0 ? ('Inactive' as const) : ('Active' as const),
  }))

  return [...primary, ...extra]
}

// ==============================
// OPTIONAL HELPERS
// ==============================

export function buildReceiptNumber(id: number) {
  return `${MASTER_RECEIPT_PREFIX}-${String(id).padStart(5, '0')}`
}

export function buildPaymentReceiptNumber(feeId: number, installmentId: number) {
  return `${MASTER_PAYMENT_RECEIPT_PREFIX}-${String(feeId).padStart(5, '0')}-${String(installmentId).padStart(3, '0')}`
}

// UI/report helpers: normalize a key into a readable label
export function getReportCategoryLabel(key: string) {
  const normalized = key.trim().toLowerCase()

  if (normalized === 'students' || normalized === 'student') return 'Students'
  if (normalized === 'attendance') return 'Attendance'
  if (normalized === 'exams' || normalized === 'exam') return 'Exams'
  if (normalized === 'fees' || normalized === 'fee') return 'Fees'
  if (normalized === 'staff') return 'Staff'

  return 'Summary'
}

// Default picks (UI initialization)
export function getDefaultExportFormat() {
  return MASTER_EXPORT_FORMATS[0]
}

export function getDefaultReportQuickFilter() {
  return MASTER_REPORT_QUICK_FILTERS[2]
}

export function getDefaultStaffRole() {
  return MASTER_STAFF_ROLES[1]
}

export function getDefaultStaffDepartment() {
  return MASTER_STAFF_DEPARTMENTS[0]
}

export function getDefaultStaffStatus() {
  return MASTER_EMPLOYMENT_STATUSES[0]
}
