// Test the React Native transformer
const { ReactNativeTransformer } = require('./lib/export/mobile/react-native-transformer.ts')

const testComponents = [
  {
    id: '1',
    type: 'button',
    props: {
      text: 'Submit',
      color: '#4F46E5'
    }
  },
  {
    id: '2',
    type: 'input',
    props: {
      label: 'Email',
      placeholder: 'Enter your email'
    }
  },
  {
    id: '3',
    type: 'text',
    props: {
      content: 'Hello World',
      size: 24,
      color: '#1F2937',
      bold: true
    }
  }
]

console.log('Testing React Native Transformer...\n')

testComponents.forEach(comp => {
  console.log(`Converting ${comp.type} component:`)
  const result = ReactNativeTransformer.convertComponent(comp)
  console.log(`- Name: ${result.name}`)
  console.log(`- Imports: ${result.imports.join(', ')}`)
  console.log('---\n')
})

console.log('✅ Transformer test complete!')
