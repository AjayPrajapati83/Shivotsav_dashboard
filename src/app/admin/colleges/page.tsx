import { getColleges } from '@/server/admin';
import { CollegesClient } from './CollegesClient';

// Revalidate every 20 seconds - colleges don't change often
export const revalidate = 20;

export default async function CollegesPage() {
  let colleges;
  try {
    colleges = await getColleges();
  } catch {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Failed to load colleges. Please refresh.</p>
      </div>
    );
  }
  return <CollegesClient colleges={colleges} />;
}
