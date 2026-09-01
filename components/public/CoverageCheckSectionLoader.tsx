import { getSupabaseCoverageAreas } from '@/lib/supabase-coverage';
import CoverageCheckSection from './CoverageCheckSection';

/**
 * Server-side loader for the Home page Coverage section.
 *
 * Coverage areas are fetched with the project's Next.js server component
 * data-fetching architecture (no client-side fetching). The page wraps this
 * component in <Suspense>, so the section streams in with a "Loading areas..."
 * fallback while Supabase resolves.
 */
export default async function CoverageCheckSectionLoader() {
  const { areas, error } = await getSupabaseCoverageAreas();
  return <CoverageCheckSection areas={areas.map((a) => a.name)} loadFailed={error} />;
}