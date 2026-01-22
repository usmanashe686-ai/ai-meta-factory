import { encrypt, decrypt, hash } from '@/lib/security/encryption'

describe('Encryption Utilities', () => {
  const testText = 'This is a secret message'
  const testPassword = 'my-password-123'
  
  test('encrypt and decrypt should work correctly', () => {
    const encrypted = encrypt(testText)
    const decrypted = decrypt(encrypted)
    
    expect(decrypted).toBe(testText)
    expect(encrypted).not.toBe(testText)
  })
  
  test('hash should produce consistent output', () => {
    const hash1 = hash(testPassword)
    const hash2 = hash(testPassword)
    
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64) // SHA256 produces 64 char hex
  })
  
  test('different inputs should produce different hashes', () => {
    const hash1 = hash('password1')
    const hash2 = hash('password2')
    
    expect(hash1).not.toBe(hash2)
  })
})
