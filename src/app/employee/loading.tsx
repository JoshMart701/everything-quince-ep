export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-40" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[0,1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-32 bg-gray-200 rounded-2xl" />
    </div>
  );
}
