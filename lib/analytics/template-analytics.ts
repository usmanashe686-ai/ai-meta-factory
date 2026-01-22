import { 
  collection, 
  doc, 
  updateDoc, 
  increment, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  setDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

export interface AnalyticsOverview {
  totalViews: number
  totalUses: number
  averageRating: number
  conversionRate: string
  revenue: number
  totalDownloads: number
}

export interface DailyUsage {
  date: string
  views: number
  uses: number
  downloads: number
}

export interface TemplateReview {
  id: string
  userName: string
  rating: number
  comment: string
  pros: string[]
  cons: string[]
  createdAt: string
  helpfulCount: number
}

export interface TopTemplate {
  id: string
  name: string
  uses: number
  rating: number
  category: string
}

export class TemplateAnalytics {
  
  // Track template view
  async trackTemplateView(templateId: string, userId?: string): Promise<void> {
    try {
      const templateRef = doc(db, 'templates', templateId)
      const templateDoc = await getDoc(templateRef)
      
      if (templateDoc.exists()) {
        // Increment view count
        await updateDoc(templateRef, {
          viewCount: increment(1),
          lastViewedAt: Timestamp.now()
        })
        
        console.log(`📊 Tracked view for template: ${templateId}`)
        
        // Record user activity if logged in
        if (userId) {
          await this.recordUserActivity(userId, templateId, 'view')
        }
        
        // Update daily stats
        await this.updateDailyStats(templateId, 'view')
      }
    } catch (error) {
      console.error('Error tracking template view:', error)
    }
  }

  // Track template usage
  async trackTemplateUse(templateId: string, userId: string, projectId: string): Promise<void> {
    try {
      const templateRef = doc(db, 'templates', templateId)
      const templateDoc = await getDoc(templateRef)
      
      if (templateDoc.exists()) {
        // Update template usage stats
        await updateDoc(templateRef, {
          usageCount: increment(1),
          lastUsedAt: Timestamp.now()
        })
        
        // Record user activity
        await this.recordUserActivity(userId, templateId, 'use', projectId)
        
        // Update daily stats
        await this.updateDailyStats(templateId, 'use')
        
        // Update author earnings if paid template
        const templateData = templateDoc.data()
        if (templateData.price && typeof templateData.price === 'number') {
          await this.updateAuthorEarnings(templateId, templateData.authorId)
        }
        
        console.log(`✅ Tracked usage for template: ${templateId}`)
      }
    } catch (error) {
      console.error('Error tracking template use:', error)
    }
  }

  // Track template download
  async trackTemplateDownload(templateId: string, userId: string): Promise<void> {
    try {
      const templateRef = doc(db, 'templates', templateId)
      
      await updateDoc(templateRef, {
        downloadCount: increment(1),
        lastDownloadedAt: Timestamp.now()
      })
      
      await this.recordUserActivity(userId, templateId, 'download')
      await this.updateDailyStats(templateId, 'download')
      
      console.log(`📥 Tracked download for template: ${templateId}`)
    } catch (error) {
      console.error('Error tracking template download:', error)
    }
  }

  // Add template review
  async addTemplateReview(
    templateId: string, 
    userId: string, 
    userName: string,
    rating: number, 
    review: string,
    pros: string[] = [],
    cons: string[] = []
  ): Promise<void> {
    try {
      const reviewRef = doc(collection(db, 'template_reviews'))
      
      await setDoc(reviewRef, {
        templateId,
        userId,
        userName,
        rating,
        review,
        pros,
        cons,
        createdAt: Timestamp.now(),
        helpfulCount: 0
      })
      
      console.log(`⭐ Added review for template: ${templateId}`)
      
      // Update template rating
      await this.updateTemplateRating(templateId)
      
    } catch (error) {
      console.error('Error adding template review:', error)
    }
  }

  // Get comprehensive template insights
  async getTemplateInsights(templateId: string, timeRange: string = '30d'): Promise<any> {
    try {
      const templateDoc = await getDoc(doc(db, 'templates', templateId))
      
      if (!templateDoc.exists()) {
        throw new Error('Template not found')
      }
      
      const template = templateDoc.data()
      
      // Get recent reviews
      const reviewsQuery = query(
        collection(db, 'template_reviews'),
        where('templateId', '==', templateId),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      
      const reviewsSnapshot = await getDocs(reviewsQuery)
      const reviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.().toLocaleDateString() || 'Unknown'
      }))
      
      // Calculate conversion rate
      const viewCount = template.viewCount || 0
      const useCount = template.usageCount || 0
      const conversionRate = viewCount > 0 ? (useCount / viewCount) * 100 : 0
      
      // Get usage trends based on time range
      const days = this.getDaysFromRange(timeRange)
      const usageData = await this.getUsageTrends(templateId, days)
      
      // Get top performing templates in same category
      const topTemplates = await this.getTopTemplates(template.category, 5)
      
      // Calculate revenue if paid template
      const revenue = template.price && typeof template.price === 'number' 
        ? (template.price * (template.salesCount || 0))
        : 0
      
      return {
        overview: {
          totalViews: viewCount,
          totalUses: useCount,
          totalDownloads: template.downloadCount || 0,
          averageRating: template.rating || 0,
          reviewCount: template.reviewCount || 0,
          conversionRate: conversionRate.toFixed(1) + '%',
          revenue: revenue.toFixed(2)
        },
        reviews: {
          total: reviews.length,
          average: template.rating || 0,
          recent: reviews
        },
        trends: {
          dailyUsage: usageData,
          popularFeatures: this.extractPopularFeatures(template),
          retentionRate: await this.calculateRetentionRate(templateId)
        },
        topTemplates,
        recommendations: this.generateRecommendations(template, usageData)
      }
      
    } catch (error) {
      console.error('Error getting template insights:', error)
      return null
    }
  }

  // Get overall platform analytics
  async getPlatformAnalytics(timeRange: string = '30d'): Promise<any> {
    try {
      const days = this.getDaysFromRange(timeRange)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // Get all templates
      const templatesQuery = query(collection(db, 'templates'))
      const templatesSnapshot = await getDocs(templatesQuery)
      const templates = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Calculate platform totals
      const totals = {
        totalTemplates: templates.length,
        totalViews: templates.reduce((sum, t) => sum + (t.viewCount || 0), 0),
        totalUses: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
        totalRevenue: templates.reduce((sum, t) => {
          if (t.price && typeof t.price === 'number') {
            return sum + (t.price * (t.salesCount || 0))
          }
          return sum
        }, 0),
        totalUsers: 0, // Would need user collection query
        averageRating: templates.reduce((sum, t) => sum + (t.rating || 0), 0) / templates.length || 0
      }
      
      // Get daily platform stats
      const dailyStats = await this.getPlatformDailyStats(startDate, endDate)
      
      // Get top categories
      const categories = this.getTopCategories(templates)
      
      // Get user growth
      const userGrowth = await this.getUserGrowth(startDate, endDate)
      
      return {
        totals,
        dailyStats,
        categories,
        userGrowth,
        timeRange
      }
      
    } catch (error) {
      console.error('Error getting platform analytics:', error)
      return null
    }
  }

  // Private helper methods
  private async recordUserActivity(
    userId: string, 
    templateId: string, 
    action: 'view' | 'use' | 'download',
    projectId?: string
  ): Promise<void> {
    try {
      const activityRef = doc(collection(db, 'user_activities'))
      
      await setDoc(activityRef, {
        userId,
        templateId,
        action,
        projectId,
        timestamp: Timestamp.now(),
        metadata: {
          userAgent: navigator?.userAgent || 'unknown',
          platform: this.getPlatformInfo()
        }
      })
    } catch (error) {
      console.error('Error recording user activity:', error)
    }
  }

  private async updateTemplateRating(templateId: string): Promise<void> {
    try {
      const reviewsQuery = query(
        collection(db, 'template_reviews'),
        where('templateId', '==', templateId)
      )
      
      const reviewsSnapshot = await getDocs(reviewsQuery)
      const reviews = reviewsSnapshot.docs.map(doc => doc.data())
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviews.length
        
        await updateDoc(doc(db, 'templates', templateId), {
          rating: parseFloat(averageRating.toFixed(1)),
          reviewCount: reviews.length
        })
      }
    } catch (error) {
      console.error('Error updating template rating:', error)
    }
  }

  private async updateAuthorEarnings(templateId: string, authorId: string): Promise<void> {
    try {
      const templateDoc = await getDoc(doc(db, 'templates', templateId))
      const templateData = templateDoc.data()
      
      if (templateData?.price && typeof templateData.price === 'number') {
        const authorRef = doc(db, 'users', authorId)
        const authorDoc = await getDoc(authorRef)
        
        if (authorDoc.exists()) {
          const currentEarnings = authorDoc.data().totalEarnings || 0
          const templatePrice = templateData.price
          const platformFee = templatePrice * 0.2 // 20% platform fee
          const authorEarnings = templatePrice - platformFee
          
          await updateDoc(authorRef, {
            totalEarnings: currentEarnings + authorEarnings,
            updatedAt: Timestamp.now()
          })
          
          // Record transaction
          const transactionRef = doc(collection(db, 'transactions'))
          await setDoc(transactionRef, {
            templateId,
            authorId,
            amount: templatePrice,
            platformFee,
            authorEarnings,
            timestamp: Timestamp.now(),
            type: 'template_sale'
          })
        }
      }
    } catch (error) {
      console.error('Error updating author earnings:', error)
    }
  }

  private async updateDailyStats(templateId: string, action: 'view' | 'use' | 'download'): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const statsRef = doc(db, 'daily_stats', `${templateId}_${today}`)
      const statsDoc = await getDoc(statsRef)
      
      const updateData: any = {
        date: today,
        templateId,
        lastUpdated: Timestamp.now()
      }
      
      if (statsDoc.exists()) {
        const currentData = statsDoc.data()
        updateData.views = action === 'view' ? (currentData.views || 0) + 1 : (currentData.views || 0)
        updateData.uses = action === 'use' ? (currentData.uses || 0) + 1 : (currentData.uses || 0)
        updateData.downloads = action === 'download' ? (currentData.downloads || 0) + 1 : (currentData.downloads || 0)
      } else {
        updateData.views = action === 'view' ? 1 : 0
        updateData.uses = action === 'use' ? 1 : 0
        updateData.downloads = action === 'download' ? 1 : 0
      }
      
      await setDoc(statsRef, updateData, { merge: true })
    } catch (error) {
      console.error('Error updating daily stats:', error)
    }
  }

  private async getUsageTrends(templateId: string, days: number): Promise<DailyUsage[]> {
    const usageData: DailyUsage[] = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const statsRef = doc(db, 'daily_stats', `${templateId}_${dateStr}`)
      const statsDoc = await getDoc(statsRef)
      
      if (statsDoc.exists()) {
        const data = statsDoc.data()
        usageData.push({
          date: dateStr,
          views: data.views || 0,
          uses: data.uses || 0,
          downloads: data.downloads || 0
        })
      } else {
        usageData.push({
          date: dateStr,
          views: 0,
          uses: 0,
          downloads: 0
        })
      }
    }
    
    return usageData
  }

  private async getTopTemplates(category: string, limitCount: number): Promise<TopTemplate[]> {
    try {
      let templatesQuery
      
      if (category === 'all') {
        templatesQuery = query(
          collection(db, 'templates'),
          orderBy('usageCount', 'desc'),
          limit(limitCount)
        )
      } else {
        templatesQuery = query(
          collection(db, 'templates'),
          where('category', '==', category),
          orderBy('usageCount', 'desc'),
          limit(limitCount)
        )
      }
      
      const snapshot = await getDocs(templatesQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        uses: doc.data().usageCount || 0,
        rating: doc.data().rating || 0,
        category: doc.data().category
      }))
    } catch (error) {
      console.error('Error getting top templates:', error)
      return []
    }
  }

  private async calculateRetentionRate(templateId: string): Promise<number> {
    // Simplified retention calculation
    // In production, this would be more sophisticated
    try {
      const activitiesQuery = query(
        collection(db, 'user_activities'),
        where('templateId', '==', templateId),
        where('action', '==', 'use')
      )
      
      const snapshot = await getDocs(activitiesQuery)
      const uniqueUsers = new Set(snapshot.docs.map(doc => doc.data().userId))
      
      return uniqueUsers.size > 0 ? (snapshot.size / uniqueUsers.size) * 100 : 0
    } catch (error) {
      console.error('Error calculating retention:', error)
      return 0
    }
  }

  private extractPopularFeatures(template: any): string[] {
    // Extract features from template data
    const features: string[] = []
    
    if (template.features && Array.isArray(template.features)) {
      features.push(...template.features)
    }
    
    if (template.tags && Array.isArray(template.tags)) {
      features.push(...template.tags.slice(0, 5))
    }
    
    return [...new Set(features)].slice(0, 10)
  }

  private generateRecommendations(template: any, usageData: DailyUsage[]): string[] {
    const recommendations: string[] = []
    const avgUses = usageData.reduce((sum, day) => sum + day.uses, 0) / usageData.length
    
    if (avgUses < 1) {
      recommendations.push('Consider promoting this template to increase usage')
    }
    
    if (template.reviewCount < 5) {
      recommendations.push('Encourage users to leave reviews for better visibility')
    }
    
    if (template.price === 'free' && usageData.some(day => day.uses > 5)) {
      recommendations.push('This template is popular - consider creating a premium version')
    }
    
    return recommendations.slice(0, 3)
  }

  private getDaysFromRange(range: string): number {
    switch (range) {
      case '24h': return 1
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      default: return 30
    }
  }

  private getPlatformInfo(): string {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent
      if (/mobile/i.test(ua)) return 'mobile'
      if (/tablet/i.test(ua)) return 'tablet'
    }
    return 'desktop'
  }

  private async getPlatformDailyStats(startDate: Date, endDate: Date): Promise<any[]> {
    // Simplified - in production, this would query aggregated daily stats
    return []
  }

  private getTopCategories(templates: any[]): any[] {
    const categoryCounts: Record<string, number> = {}
    
    templates.forEach(template => {
      const category = template.category || 'uncategorized'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
    
    return Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private async getUserGrowth(startDate: Date, endDate: Date): Promise<number> {
    // Simplified - in production, this would query user registrations
    return 0
  }
}

// Export singleton instance
export const templateAnalytics = new TemplateAnalytics()
