-- Temporary: Allow public read access to lab_results for development
-- This should be removed in production when authentication is enabled

-- Drop the existing policy that requires authentication
DROP POLICY IF EXISTS "Lab results readable by members" ON public.lab_results;

-- Create a new policy that allows all authenticated and anonymous users to read
CREATE POLICY "Lab results readable by all (temporary)" ON public.lab_results
  FOR SELECT
  USING (true);

-- Also update lab_parsed_values
DROP POLICY IF EXISTS "Lab parsed values readable by members" ON public.lab_parsed_values;

CREATE POLICY "Lab parsed values readable by all (temporary)" ON public.lab_parsed_values
  FOR SELECT
  USING (true);

-- Note: This is for development only. In production, revert to the original policies
-- that check patient_memberships