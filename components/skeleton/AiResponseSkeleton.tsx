export default function AiResponseSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-3 pl-12">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        <div className="h-8 bg-gray-200 rounded w-32 mt-4"></div>
      </div>
    </div>
  )
}
