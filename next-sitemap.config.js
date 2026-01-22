/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://usman-umer.web.app',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/settings'],
      },
    ],
    additionalSitemaps: [
      'https://usman-umer.web.app/sitemap.xml',
    ],
  },
  exclude: ['/api/*', '/admin/*', '/dashboard/settings'],
  transform: async (config, path) => {
    // Custom priority based on page importance
    let priority = 0.7
    let changefreq = 'weekly'
    
    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path.startsWith('/pricing')) {
      priority = 0.9
    } else if (path.startsWith('/builder')) {
      priority = 0.8
      changefreq = 'daily'
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    }
  },
}
