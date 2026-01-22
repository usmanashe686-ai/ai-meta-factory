import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY || 'dev-key-change-in-prod'

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString()
}

export function encryptSensitiveData(data: Record<string, any>): Record<string, any> {
  const encrypted: Record<string, any> = {}
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' && isSensitiveKey(key)) {
      encrypted[key] = encrypt(value)
    } else {
      encrypted[key] = value
    }
  })
  
  return encrypted
}

export function decryptSensitiveData(data: Record<string, any>): Record<string, any> {
  const decrypted: Record<string, any> = {}
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' && isSensitiveKey(key)) {
      try {
        decrypted[key] = decrypt(value)
      } catch {
        decrypted[key] = value
      }
    } else {
      decrypted[key] = value
    }
  })
  
  return decrypted
}

function isSensitiveKey(key: string): boolean {
  const sensitiveKeys = [
    'apiKey',
    'secret',
    'password',
    'token',
    'key',
    'credential',
  ]
  
  return sensitiveKeys.some(sk => 
    key.toLowerCase().includes(sk.toLowerCase())
  )
}
