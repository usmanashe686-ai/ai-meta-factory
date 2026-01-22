'use client'

import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TemplateFiltersProps {
  filters: any
  onFilterChange: (key: string, value: any) => void
  categories: Array<{
    id: string
    name: string
    icon?: any
    count?: number
    color?: string
  }>
}

export default function TemplateFilters({ filters, onFilterChange, categories }: TemplateFiltersProps) {
  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ]

  const priceOptions = [
    { id: 'all', name: 'All Prices' },
    { id: 'free', name: 'Free Only' },
    { id: 'paid', name: 'Paid Only' }
  ]

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'newest', name: 'Newest First' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'downloads', name: 'Most Downloaded' },
    { id: 'trending', name: 'Trending Now' }
  ]

  const frameworks = [
    { id: 'all', name: 'All Frameworks' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue.js' },
    { id: 'angular', name: 'Angular' },
    { id: 'svelte', name: 'Svelte' }
  ]

  const clearAllFilters = () => {
    onFilterChange('category', 'all')
    onFilterChange('difficulty', 'all')
    onFilterChange('price', 'all')
    onFilterChange('sortBy', 'popular')
    onFilterChange('search', '')
    onFilterChange('framework', 'all')
  }

  const hasActiveFilters = () => {
    return filters.category !== 'all' || 
           filters.difficulty !== 'all' || 
           filters.price !== 'all' ||
           filters.sortBy !== 'popular' ||
           filters.search ||
           filters.framework !== 'all'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <h4 className="font-medium mb-3">Search</h4>
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full p-2 border rounded-lg"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        <Separator />

        {/* Categories */}
        <div>
          <h4 className="font-medium mb-3">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    filters.category === category.id
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onFilterChange('category', category.id)}
                >
                  <div className="flex items-center">
                    {Icon && (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        category.color || 'bg-gray-100'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    )}
                    <span>{category.name}</span>
                  </div>
                  {category.count !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Price */}
        <div>
          <h4 className="font-medium mb-3">Price</h4>
          <div className="space-y-2">
            {priceOptions.map((option) => (
              <button
                key={option.id}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  filters.price === option.id
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onFilterChange('price', option.id)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Difficulty */}
        <div>
          <h4 className="font-medium mb-3">Difficulty</h4>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.id}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  filters.difficulty === difficulty.id
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onFilterChange('difficulty', difficulty.id)}
              >
                {difficulty.name}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Sort By */}
        <div>
          <h4 className="font-medium mb-3">Sort By</h4>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  filters.sortBy === option.id
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onFilterChange('sortBy', option.id)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Framework */}
        <div>
          <h4 className="font-medium mb-3">Framework</h4>
          <div className="space-y-2">
            {frameworks.map((framework) => (
              <button
                key={framework.id}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  filters.framework === framework.id
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onFilterChange('framework', framework.id)}
              >
                {framework.name}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div>
            <h4 className="font-medium mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.id === filters.category)?.name}
                  <button
                    onClick={() => onFilterChange('category', 'all')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.difficulty !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {difficulties.find(d => d.id === filters.difficulty)?.name}
                  <button
                    onClick={() => onFilterChange('difficulty', 'all')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.price !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {priceOptions.find(p => p.id === filters.price)?.name}
                  <button
                    onClick={() => onFilterChange('price', 'all')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <button
                    onClick={() => onFilterChange('search', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
