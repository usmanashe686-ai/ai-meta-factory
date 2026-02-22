import { Strategy as SamlStrategy } from 'passport-saml';
import { PassportStatic } from 'passport';

export interface SAMLConfig {
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert?: string;
  privateKey?: string;
  decryptionPvk?: string;
  signatureAlgorithm?: 'sha1' | 'sha256' | 'sha512';
}

export class SAMLProvider {
  private strategy: SamlStrategy;

  constructor(config: SAMLConfig) {
    this.strategy = new SamlStrategy(
      {
        entryPoint: config.entryPoint,
        issuer: config.issuer,
        callbackUrl: config.callbackUrl,
        cert: config.cert,
        privateKey: config.privateKey,
        decryptionPvk: config.decryptionPvk,
        signatureAlgorithm: config.signatureAlgorithm || 'sha256',
      },
      (profile: any, done: (err: any, user?: any) => void) => {
        // Transform SAML profile to your user object
        const user = {
          id: profile.nameID,
          email: profile.email || profile.nameID,
          name: profile.displayName || profile.cn,
        };
        return done(null, user);
      }
    );
  }

  public initialize(passport: PassportStatic): void {
    passport.use('saml', this.strategy);
  }

  public getStrategy(): SamlStrategy {
    return this.strategy;
  }
}
