export type UserRole = 'super_admin' | 'sales_referrer' | 'client' | 'freelancer' | 'project_manager'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  referral_id: string | null
  referred_by: string | null
  company_name: string | null
  gstin: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  source: string | null
  referral_id: string | null
  referred_by: string | null
  status: LeadStatus
  estimated_value: number | null
  probability: number
  notes: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  client_id: string
  company_id: string | null
  project_manager_id: string | null
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  budget: number | null
  actual_cost: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  milestone_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: string
  assignee_id: string | null
  estimated_hours: number | null
  actual_hours: number
  due_date: string | null
  completed_date: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  quote_id: string | null
  client_id: string
  company_id: string | null
  project_id: string | null
  subject: string
  due_date: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  status: InvoiceStatus
  notes: string | null
  pdf_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  amount: number
  status: PaymentStatus
  payment_method: string | null
  payment_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  sales_referrer_id: string
  invoice_id: string
  lead_id: string | null
  commission_rate: number
  invoice_amount: number
  commission_amount: number
  status: string
  paid_at: string | null
  created_at: string
}

