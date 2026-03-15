<template>
  <div class="staff-page fade-in">
    <section class="stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <p>Total Staff</p>
          <h3>{{ store.total }}</h3>
          <small>All staff records</small>
        </div>
      </div>

      <div class="stat-card stat-card-active">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Active</p>
          <h3>{{ store.activeCount }}</h3>
          <small>Currently active staff</small>
        </div>
      </div>

      <div class="stat-card stat-card-inactive">
        <div class="stat-icon">⏸️</div>
        <div class="stat-content">
          <p>Inactive</p>
          <h3>{{ store.inactiveCount }}</h3>
          <small>Inactive profiles</small>
        </div>
      </div>

      <div class="stat-card stat-card-salary">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <p>Avg Salary</p>
          <h3>{{ formatCurrencyShort(store.averageSalary) }}</h3>
          <small>Total {{ formatCurrencyShort(store.totalSalary) }}</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Administration</p>
          <h2>Staff List</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model.trim="search"
              type="text"
              placeholder="Search by name, code, email, phone, city..."
            />
          </div>

          <router-link class="app-btn app-btn-primary app-btn-pill top-add-btn" to="/staff/add">
            + Add Staff
          </router-link>
        </div>
      </div>

      <div class="toolbar">
        <div class="quick-tabs">
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'All' }"
            @click="quickStatus = 'All'"
          >
            All
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Active' }"
            @click="quickStatus = 'Active'"
          >
            Active
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Inactive' }"
            @click="quickStatus = 'Inactive'"
          >
            Inactive
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'On Leave' }"
            @click="quickStatus = 'On Leave'"
          >
            On Leave
          </button>
        </div>

        <div class="toolbar-grid">
          <div class="toolbar-field">
            <label>Role</label>
            <select v-model="selectedRole">
              <option value="">All Roles</option>
              <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Department</label>
            <select v-model="selectedDepartment">
              <option value="">All Departments</option>
              <option v-for="department in departments" :key="department" :value="department">
                {{ department }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Status</label>
            <select v-model="selectedStatus">
              <option value="">All Status</option>
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Gender</label>
            <select v-model="selectedGender">
              <option value="">All Gender</option>
              <option v-for="gender in genders" :key="gender" :value="gender">{{ gender }}</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>City</label>
            <select v-model="selectedCity">
              <option value="">All Cities</option>
              <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Joining From</label>
            <input v-model="dateFrom" type="date" />
          </div>

          <div class="toolbar-field">
            <label>Joining To</label>
            <input v-model="dateTo" type="date" />
          </div>
        </div>

        <div class="toolbar-actions">
          <div class="toolbar-actions-left">
            <button class="app-btn app-btn-secondary compact-btn" @click="resetFilters">
              Reset
            </button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportCsv">CSV</button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportJson">JSON</button>
            <button class="app-btn app-btn-secondary compact-btn" @click="printTable">
              Print / PDF
            </button>
          </div>

          <div class="toolbar-actions-right">
            <button
              class="app-btn app-btn-danger compact-btn"
              :disabled="selectedIds.length === 0"
              @click="deleteSelected"
            >
              Delete
            </button>

            <button
              v-if="showUndo"
              class="app-btn app-btn-secondary compact-btn"
              @click="undoDelete"
            >
              Undo
            </button>
          </div>
        </div>
      </div>

      <div class="table-meta">
        <div class="table-meta-left">
          <span class="meta-chip">{{ selectedIds.length }} selected</span>
          <span class="meta-chip soft-chip">{{ filteredRows.length }} records found</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="staff-table">
          <thead>
            <tr>
              <th class="checkbox-col sticky-left">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  @change="toggleSelectAllVisible"
                  aria-label="Select all visible staff"
                />
              </th>

              <th>Code</th>

              <th>Name</th>

              <th>
                <div class="th-filter-box">
                  <span>Role</span>
                  <select v-model="headerRole" @click.stop>
                    <option value="">All</option>
                    <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                  </select>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Department</span>
                  <select v-model="headerDepartment" @click.stop>
                    <option value="">All</option>
                    <option v-for="department in departments" :key="department" :value="department">
                      {{ department }}
                    </option>
                  </select>
                </div>
              </th>

              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>City</th>

              <th>
                <div class="th-filter-box">
                  <span>Status</span>
                  <select v-model="headerStatus" @click.stop>
                    <option value="">All</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </th>

              <th>Joining Date</th>
              <th class="right">Salary</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="12" class="empty-state">No staff records found for current filters.</td>
            </tr>

            <tr
              v-for="row in filteredRows"
              :key="row.id"
              :class="{ 'row-selected': selectedIds.includes(row.id) }"
            >
              <td class="checkbox-col sticky-left body-sticky">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(row.id)"
                  @change="toggleSelection(row.id)"
                />
              </td>

              <td>{{ row.staffCode }}</td>

              <td>
                <button class="staff-link" @click="goView(row.id)">
                  <span class="staff-link-name">{{ row.fullName }}</span>
                  <span class="staff-link-meta">{{ row.city }} • {{ row.gender }}</span>
                </button>
              </td>

              <td>{{ row.role }}</td>
              <td>{{ row.department }}</td>
              <td>{{ row.email }}</td>
              <td>{{ row.phone }}</td>
              <td>{{ row.gender }}</td>
              <td>{{ row.city }}</td>

              <td>
                <span class="status-pill" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>

              <td>{{ formatDate(row.joiningDate) }}</td>
              <td class="right">{{ formatCurrency(row.salary) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  cityOptions,
  genderOptions,
  departmentOptions,
  staffRoleOptions,
  statusOptions,
  useStaffStore,
} from '@/stores/staffStore'
import type { Staff, StaffRole, StaffStatus } from '@/types/staff'

const router = useRouter()
const store = useStaffStore()

const search = ref('')
const selectedRole = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')
const selectedGender = ref('')
const selectedCity = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const quickStatus = ref<'All' | StaffStatus>('All')

const headerRole = ref('')
const headerDepartment = ref('')
const headerStatus = ref('')

const selectedIds = ref<number[]>([])
const deletedItems = ref<Staff[]>([])
const showUndo = ref(false)

onMounted(() => {
  store.init()
})

const roles = computed<StaffRole[]>(() => [...staffRoleOptions])
const departments = computed(() => [...departmentOptions])
const statuses = computed<StaffStatus[]>(() => [...statusOptions])
const genders = computed(() => [...genderOptions])
const cities = computed(() => [...cityOptions])

const filteredRows = computed(() => {
  const q = search.value.toLowerCase().trim()

  return store.items.filter((row) => {
    const matchesSearch =
      !q ||
      row.fullName.toLowerCase().includes(q) ||
      row.staffCode.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.phone.toLowerCase().includes(q) ||
      row.city.toLowerCase().includes(q) ||
      row.department.toLowerCase().includes(q)

    const matchesRole = !selectedRole.value || row.role === selectedRole.value
    const matchesDepartment =
      !selectedDepartment.value || row.department === selectedDepartment.value
    const matchesStatus = !selectedStatus.value || row.status === selectedStatus.value
    const matchesGender = !selectedGender.value || row.gender === selectedGender.value
    const matchesCity = !selectedCity.value || row.city === selectedCity.value
    const matchesQuick = quickStatus.value === 'All' || row.status === quickStatus.value

    const matchesHeaderRole = !headerRole.value || row.role === headerRole.value
    const matchesHeaderDepartment =
      !headerDepartment.value || row.department === headerDepartment.value
    const matchesHeaderStatus = !headerStatus.value || row.status === headerStatus.value

    const matchesFrom = !dateFrom.value || row.joiningDate >= dateFrom.value
    const matchesTo = !dateTo.value || row.joiningDate <= dateTo.value

    return (
      matchesSearch &&
      matchesRole &&
      matchesDepartment &&
      matchesStatus &&
      matchesGender &&
      matchesCity &&
      matchesQuick &&
      matchesHeaderRole &&
      matchesHeaderDepartment &&
      matchesHeaderStatus &&
      matchesFrom &&
      matchesTo
    )
  })
})

const isAllVisibleSelected = computed(() => {
  if (!filteredRows.value.length) return false
  return filteredRows.value.every((row) => selectedIds.value.includes(row.id))
})

function toggleSelection(id: number) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

function toggleSelectAllVisible() {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(filteredRows.value.map((row) => row.id))
    selectedIds.value = selectedIds.value.filter((id) => !visibleIds.has(id))
    return
  }

  const merged = new Set([...selectedIds.value, ...filteredRows.value.map((row) => row.id)])
  selectedIds.value = [...merged]
}

function resetFilters() {
  search.value = ''
  selectedRole.value = ''
  selectedDepartment.value = ''
  selectedStatus.value = ''
  selectedGender.value = ''
  selectedCity.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  quickStatus.value = 'All'
  headerRole.value = ''
  headerDepartment.value = ''
  headerStatus.value = ''
}

function statusClass(status: StaffStatus): string {
  if (status === 'Active') return 'status-active'
  if (status === 'Inactive') return 'status-inactive'
  return 'status-leave'
}

function goView(id: number) {
  router.push(`/staff/view/${id}`)
}

function deleteSelected() {
  if (!selectedIds.value.length) return

  const ok = window.confirm(
    `Are you sure you want to delete ${selectedIds.value.length} selected staff record(s)?`,
  )
  if (!ok) return

  const removed = store.removeMany(selectedIds.value)
  deletedItems.value = removed
  showUndo.value = removed.length > 0
  selectedIds.value = []
}

function undoDelete() {
  if (!deletedItems.value.length) return
  store.restoreMany(deletedItems.value)
  deletedItems.value = []
  showUndo.value = false
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatCurrencyShort(value: number) {
  const amount = Number(value || 0)
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

function sanitize(value: string | number) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function getExportRows() {
  return filteredRows.value.map((row) => ({
    StaffCode: row.staffCode,
    FullName: row.fullName,
    Role: row.role,
    Department: row.department,
    Email: row.email,
    Phone: row.phone,
    Gender: row.gender,
    City: row.city,
    Status: row.status,
    JoiningDate: row.joiningDate,
    Salary: row.salary,
  }))
}

function downloadFile(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function exportCsv() {
  const exportRows = getExportRows()
  const headers = Object.keys(
    exportRows[0] ?? {
      StaffCode: '',
      FullName: '',
      Role: '',
      Department: '',
      Email: '',
      Phone: '',
      Gender: '',
      City: '',
      Status: '',
      JoiningDate: '',
      Salary: '',
    },
  )

  const csv = [
    headers.join(','),
    ...exportRows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'staff-export.csv', 'text/csv;charset=utf-8;')
}

function exportJson() {
  downloadFile(JSON.stringify(getExportRows(), null, 2), 'staff-export.json', 'application/json')
}

function printTable() {
  const exportRows = getExportRows()

  const html = `
    <html>
      <head>
        <title>Staff Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Staff Report</h2>
        <table>
          <thead>
            <tr>
              <th>Staff Code</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>City</th>
              <th>Status</th>
              <th>Joining Date</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            ${exportRows
              .map(
                (row) => `
              <tr>
                <td>${row.StaffCode}</td>
                <td>${row.FullName}</td>
                <td>${row.Role}</td>
                <td>${row.Department}</td>
                <td>${row.Email}</td>
                <td>${row.Phone}</td>
                <td>${row.Gender}</td>
                <td>${row.City}</td>
                <td>${row.Status}</td>
                <td>${row.JoiningDate}</td>
                <td>${row.Salary}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=1200,height=800')
  if (!printWindow) return
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
</script>

<style scoped>
.staff-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 22px 20px;
  color: white;
  min-height: 130px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.14);
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: auto -30px -30px auto;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.stat-card-total {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.stat-card-active {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}

.stat-card-inactive {
  background: linear-gradient(135deg, #b91c1c, #ef4444);
}

.stat-card-salary {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}

.stat-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content p {
  font-size: 14px;
  opacity: 0.92;
  margin-bottom: 6px;
}

.stat-content h3 {
  font-size: 34px;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-content small {
  opacity: 0.86;
  font-size: 12px;
}

.panel {
  padding: 22px;
  border-radius: 24px;
}

.section-top {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.title-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: #111827;
  margin-bottom: 8px;
}

.section-top h2 {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
}

.section-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-left: auto;
}

.search-box {
  width: 360px;
  max-width: 100%;
  position: relative;
}

.search-box input {
  padding-left: 42px;
  height: 50px;
  border-radius: 999px;
  background: #ffffff;
  border: 2px solid #c7d2fe;
  color: #111827;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.08);
}

.search-box input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  font-size: 16px;
  opacity: 0.8;
}

.top-add-btn {
  min-width: 150px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.72)), var(--card-bg);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.quick-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-tab {
  min-height: 38px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #243b73;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
}

.quick-tab.active {
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.18);
}

.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}

.toolbar-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar-field label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.3px;
}

.toolbar-field select,
.toolbar-field input {
  min-height: 44px;
  background: #ffffff;
  border: 1px solid #dbe3f3;
  color: #111827;
  font-weight: 500;
}

.toolbar-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-actions-left,
.toolbar-actions-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.compact-btn {
  min-height: 40px;
  padding: 8px 14px;
  font-size: 14px;
}

.table-meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.table-meta-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  background: rgba(79, 70, 229, 0.12);
  color: #3730a3;
}

.soft-chip {
  background: rgba(148, 163, 184, 0.14);
  color: #334155;
}

.table-wrapper {
  width: 100%;
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.92);
}

.staff-table {
  width: 100%;
  min-width: 1500px;
  border-collapse: collapse;
}

.staff-table thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: linear-gradient(180deg, #eff4ff, #e9eefc);
  color: #1e293b;
  font-size: 13px;
  letter-spacing: 0.2px;
  font-weight: 800;
  padding: 12px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  white-space: nowrap;
  vertical-align: top;
}

.th-filter-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.th-filter-box span {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
}

.th-filter-box select {
  min-height: 34px;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
}

.staff-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.staff-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.staff-table tbody tr:hover td {
  background: rgba(79, 70, 229, 0.05);
}

.row-selected td {
  background: rgba(79, 70, 229, 0.08) !important;
}

.checkbox-col {
  width: 58px;
  min-width: 58px;
  text-align: center;
}

.sticky-left {
  position: sticky;
  left: 0;
  z-index: 4;
}

.body-sticky {
  z-index: 1;
}

.staff-link {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  text-align: left;
}

.staff-link-name {
  color: var(--primary);
  font-weight: 800;
  font-size: 14px;
  line-height: 1.2;
}

.staff-link-meta {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-active {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.status-inactive {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.status-leave {
  color: #92400e;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.right {
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 28px 16px !important;
  font-weight: 600;
  color: #64748b;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .section-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
  }

  .search-box {
    width: 100%;
  }

  .toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions-left,
  .toolbar-actions-right {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .toolbar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .staff-page {
    gap: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 16px;
  }

  .section-top h2 {
    font-size: 24px;
  }

  .toolbar {
    padding: 12px;
  }

  .toolbar-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-actions-left,
  .toolbar-actions-right {
    width: 100%;
  }

  .toolbar-actions-left > *,
  .toolbar-actions-right > * {
    flex: 1 1 100%;
  }

  .top-add-btn {
    width: 100%;
  }
}
</style>
