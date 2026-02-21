
-- Drop existing SELECT policies that require authentication
DROP POLICY IF EXISTS "Authenticated can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated can view subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated can view chapters" ON public.chapters;
DROP POLICY IF EXISTS "Authenticated can view content" ON public.content;

-- Create new policies allowing anonymous (public) read access
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Anyone can view subjects"
ON public.subjects FOR SELECT
USING (true);

CREATE POLICY "Anyone can view chapters"
ON public.chapters FOR SELECT
USING (true);

CREATE POLICY "Anyone can view content"
ON public.content FOR SELECT
USING (true);
