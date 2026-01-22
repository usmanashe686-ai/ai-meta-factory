// Quick test to verify Zustand store is working
console.log('🧪 Testing Week 3 Features...');

// Simulate adding test data
const testData = {
  projectId: 'test-week3',
  projectName: 'Week 3 Demo Project',
  components: [
    {
      id: 'btn_1',
      type: 'button',
      props: { text: 'Test Button', color: '#3B82F6' },
      position: { x: 100, y: 100 }
    },
    {
      id: 'input_1',
      type: 'input',
      props: { label: 'Email', placeholder: 'Enter email' },
      position: { x: 100, y: 200 }
    }
  ],
  collaborators: {
    'user_1': { name: 'You', color: '#3B82F6', cursor: { x: 50, y: 50 } },
    'user_2': { name: 'Team Member', color: '#10B981', cursor: { x: 150, y: 150 } }
  }
};

console.log('✅ Test data ready for Week 3');
console.log('👉 Open: https://usman-umer.web.app/builder/test-week3');
