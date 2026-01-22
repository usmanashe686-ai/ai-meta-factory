const fetch = require('node-fetch')

async function testTemplateAPI() {
  console.log('🧪 Testing Template Marketplace API...\n')
  
  try {
    // Test 1: Get all templates
    console.log('1. Testing GET /api/templates...')
    const res1 = await fetch('http://localhost:3000/api/templates')
    const data1 = await res1.json()
    console.log('✅ Status:', res1.status)
    console.log('📊 Response:', data1.success ? 'Success' : 'Failed')
    console.log('📦 Templates found:', data1.data?.templates?.length || 0)
    
    // Test 2: Get templates with category filter
    console.log('\n2. Testing GET /api/templates?category=dashboard...')
    const res2 = await fetch('http://localhost:3000/api/templates?category=dashboard')
    const data2 = await res2.json()
    console.log('✅ Status:', res2.status)
    console.log('📊 Response:', data2.success ? 'Success' : 'Failed')
    
    // Test 3: Test stats endpoint
    console.log('\n3. Testing GET /api/templates/stats...')
    const res3 = await fetch('http://localhost:3000/api/templates/stats')
    const data3 = await res3.json()
    console.log('✅ Status:', res3.status)
    console.log('📊 Response:', data3.success ? 'Success' : 'Failed')
    if (data3.success) {
      console.log('📈 Stats:', data3.data)
    }
    
    console.log('\n🎉 All API tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testTemplateAPI()
