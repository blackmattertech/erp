-- Add approval_status to freelancers table
ALTER TABLE public.freelancers 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update existing freelancers to approved if they don't have a status
UPDATE public.freelancers 
SET approval_status = 'approved' 
WHERE approval_status IS NULL;

