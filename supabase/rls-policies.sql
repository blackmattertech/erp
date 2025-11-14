-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gst_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_accounts ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super Admin: Full access to profiles"
ON public.profiles FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'super_admin')
WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Project Managers and Sales Referrers can read client profiles
CREATE POLICY "Managers can read client profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) IN ('project_manager', 'sales_referrer', 'super_admin')
  OR auth.uid() = id
);

-- ============================================
-- SALES REFERRERS POLICIES
-- ============================================

CREATE POLICY "Sales Referrers can read own data"
ON public.sales_referrers FOR SELECT
TO authenticated
USING (id = auth.uid() OR get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Super Admin: Full access to sales referrers"
ON public.sales_referrers FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'super_admin')
WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- ============================================
-- FREELANCERS POLICIES
-- ============================================

CREATE POLICY "Freelancers can read own data"
ON public.freelancers FOR SELECT
TO authenticated
USING (id = auth.uid() OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager'));

CREATE POLICY "Freelancers can update own data"
ON public.freelancers FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Super Admin: Full access to freelancers"
ON public.freelancers FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'super_admin')
WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- ============================================
-- COMPANIES POLICIES
-- ============================================

CREATE POLICY "Clients can read own companies"
ON public.companies FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager', 'sales_referrer')
);

CREATE POLICY "Super Admin and Managers can manage companies"
ON public.companies FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) IN ('super_admin', 'project_manager'))
WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'project_manager'));

-- ============================================
-- LEADS POLICIES
-- ============================================

CREATE POLICY "Sales Referrers can read own leads"
ON public.leads FOR SELECT
TO authenticated
USING (
  referred_by = auth.uid()
  OR assigned_to = auth.uid()
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
);

CREATE POLICY "Sales Referrers can create leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role(auth.uid()) IN ('super_admin', 'sales_referrer', 'project_manager')
);

CREATE POLICY "Sales Referrers can update own leads"
ON public.leads FOR UPDATE
TO authenticated
USING (
  referred_by = auth.uid()
  OR assigned_to = auth.uid()
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
);

CREATE POLICY "Super Admin: Full access to leads"
ON public.leads FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'super_admin')
WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- ============================================
-- LEAD ACTIVITIES POLICIES
-- ============================================

CREATE POLICY "Users can read activities for accessible leads"
ON public.lead_activities FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = lead_activities.lead_id
    AND (
      leads.referred_by = auth.uid()
      OR leads.assigned_to = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

CREATE POLICY "Sales Referrers can create activities"
ON public.lead_activities FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role(auth.uid()) IN ('super_admin', 'sales_referrer', 'project_manager')
);

-- ============================================
-- PROJECTS POLICIES
-- ============================================

CREATE POLICY "Users can read accessible projects"
ON public.projects FOR SELECT
TO authenticated
USING (
  client_id = auth.uid()
  OR project_manager_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = projects.id
    AND project_members.member_id = auth.uid()
  )
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
);

CREATE POLICY "Managers can create projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'project_manager'));

CREATE POLICY "Managers can update projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
  project_manager_id = auth.uid()
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
);

-- ============================================
-- PROJECT MEMBERS POLICIES
-- ============================================

CREATE POLICY "Users can read project members"
ON public.project_members FOR SELECT
TO authenticated
USING (
  member_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
    AND (
      projects.client_id = auth.uid()
      OR projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

CREATE POLICY "Managers can manage project members"
ON public.project_members FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

-- ============================================
-- TASKS POLICIES
-- ============================================

CREATE POLICY "Users can read accessible tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
  assignee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tasks.project_id
    AND (
      projects.client_id = auth.uid()
      OR projects.project_manager_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_members.project_id = projects.id
        AND project_members.member_id = auth.uid()
      )
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

CREATE POLICY "Managers can manage tasks"
ON public.tasks FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tasks.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
  OR assignee_id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tasks.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
  OR assignee_id = auth.uid()
);

-- ============================================
-- TIME ENTRIES POLICIES
-- ============================================

CREATE POLICY "Users can read own time entries"
ON public.time_entries FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = time_entries.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

CREATE POLICY "Users can create own time entries"
ON public.time_entries FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own time entries"
ON public.time_entries FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- TIMESHEETS POLICIES
-- ============================================

CREATE POLICY "Freelancers can read own timesheets"
ON public.timesheets FOR SELECT
TO authenticated
USING (
  freelancer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = timesheets.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

CREATE POLICY "Freelancers can manage own timesheets"
ON public.timesheets FOR ALL
TO authenticated
USING (freelancer_id = auth.uid())
WITH CHECK (freelancer_id = auth.uid());

-- ============================================
-- INVOICES POLICIES
-- ============================================

CREATE POLICY "Clients can read own invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (
  client_id = auth.uid()
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager', 'sales_referrer')
);

CREATE POLICY "Managers can manage invoices"
ON public.invoices FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) IN ('super_admin', 'project_manager'))
WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'project_manager'));

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

CREATE POLICY "Users can read accessible payments"
ON public.payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = payments.invoice_id
    AND (
      invoices.client_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager', 'sales_referrer')
    )
  )
);

CREATE POLICY "Clients can create payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = payments.invoice_id
    AND invoices.client_id = auth.uid()
  )
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
);

-- ============================================
-- COMMISSIONS POLICIES
-- ============================================

CREATE POLICY "Sales Referrers can read own commissions"
ON public.commissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sales_referrers
    WHERE sales_referrers.id = commissions.sales_referrer_id
    AND sales_referrers.id = auth.uid()
  )
  OR get_user_role(auth.uid()) IN ('super_admin')
);

CREATE POLICY "Super Admin: Full access to commissions"
ON public.commissions FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'super_admin')
WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- ============================================
-- BONUSES POLICIES
-- ============================================

CREATE POLICY "Sales Referrers can read own bonuses"
ON public.bonuses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sales_referrers
    WHERE sales_referrers.id = bonuses.sales_referrer_id
    AND sales_referrers.id = auth.uid()
  )
  OR get_user_role(auth.uid()) IN ('super_admin')
);

CREATE POLICY "Super Admin: Full access to bonuses"
ON public.bonuses FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'super_admin')
WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- ============================================
-- EXPENSES POLICIES
-- ============================================

CREATE POLICY "Users can read accessible expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = expenses.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

CREATE POLICY "Users can create expenses"
ON public.expenses FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Managers can approve expenses"
ON public.expenses FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = expenses.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

-- ============================================
-- PROJECT FILES POLICIES
-- ============================================

CREATE POLICY "Users can read accessible files"
ON public.project_files FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_files.project_id
    AND (
      projects.client_id = auth.uid()
      OR projects.project_manager_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_members.project_id = projects.id
        AND project_members.member_id = auth.uid()
      )
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

CREATE POLICY "Users can upload files"
ON public.project_files FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_files.project_id
    AND (
      projects.project_manager_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_members.project_id = projects.id
        AND project_members.member_id = auth.uid()
      )
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

-- ============================================
-- MESSAGES POLICIES
-- ============================================

CREATE POLICY "Users can read own messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid()
  OR recipient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = messages.project_id
    AND (
      projects.client_id = auth.uid()
      OR projects.project_manager_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_members.project_id = projects.id
        AND project_members.member_id = auth.uid()
      )
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = messages.project_id
    AND (
      projects.client_id = auth.uid()
      OR projects.project_manager_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_members.project_id = projects.id
        AND project_members.member_id = auth.uid()
      )
      OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
    )
  )
);

-- ============================================
-- SERVICE REQUESTS POLICIES
-- ============================================

CREATE POLICY "Clients can read own service requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (
  client_id = auth.uid()
  OR assigned_to = auth.uid()
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
);

CREATE POLICY "Clients can create service requests"
ON public.service_requests FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Managers can update service requests"
ON public.service_requests FOR UPDATE
TO authenticated
USING (
  assigned_to = auth.uid()
  OR get_user_role(auth.uid()) IN ('super_admin', 'project_manager')
);

