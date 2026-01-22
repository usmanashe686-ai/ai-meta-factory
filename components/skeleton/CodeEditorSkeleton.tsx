export default function CodeEditorSkeleton() {
  return (
    <div className="animate-pulse h-full flex flex-col">
      <div className="h-10 bg-gray-200 rounded-t-lg flex items-center px-4 space-x-4">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </div>
      <div className="flex-1 bg-gray-100 rounded-b-lg">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 bg-gray-300 rounded w-6 text-xs text-gray-500">{i}</div>
              <div className={`h-4 bg-gray-300 rounded ${i % 3 === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-1/2' : 'w-full'}`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
