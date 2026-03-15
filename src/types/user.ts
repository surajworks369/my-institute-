export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'student'
  token?: string
}
