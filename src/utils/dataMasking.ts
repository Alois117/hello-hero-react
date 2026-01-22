/**
 * Data Masking Utilities for Role-Based Data Protection
 * Implements enterprise-grade data masking for sensitive information
 */

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface MaskingConfig {
  field: string;
  allowedRoles: UserRole[];
  maskingStrategy: 'email' | 'phone' | 'partial' | 'full' | 'none';
}

/**
 * Mask email addresses based on user role
 * Example: john.doe@company.com -> j***.d**@company.com
 */
export const maskEmail = (email: string, userRole: UserRole): string => {
  if (userRole === 'super_admin' || userRole === 'admin') {
    return email;
  }

  const [local, domain] = email.split('@');
  if (!domain) return '***@***.***';

  const maskedLocal = local.length > 2 
    ? `${local[0]}***${local[local.length - 1]}`
    : '***';

  const [domainName, tld] = domain.split('.');
  const maskedDomain = domainName.length > 2
    ? `${domainName[0]}***${domainName[domainName.length - 1]}`
    : '***';

  return `${maskedLocal}@${maskedDomain}.${tld}`;
};

/**
 * Mask phone numbers based on user role
 * Example: +1-555-123-4567 -> +1-***-***-4567
 */
export const maskPhone = (phone: string, userRole: UserRole): string => {
  if (userRole === 'super_admin' || userRole === 'admin') {
    return phone;
  }

  // Keep country code and last 4 digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***-***-****';

  const countryCode = phone.startsWith('+') ? '+' + digits.slice(0, 1) : '';
  const lastFour = digits.slice(-4);
  
  return `${countryCode}-***-***-${lastFour}`;
};

/**
 * Partial masking - shows first and last characters
 * Example: secretAPIkey123 -> s***3
 */
export const maskPartial = (value: string, userRole: UserRole): string => {
  if (userRole === 'super_admin' || userRole === 'admin') {
    return value;
  }

  if (value.length <= 2) return '***';
  return `${value[0]}***${value[value.length - 1]}`;
};

/**
 * Full masking - replaces entire value
 */
export const maskFull = (value: string, userRole: UserRole): string => {
  if (userRole === 'super_admin') {
    return value;
  }
  return '*'.repeat(Math.min(value.length, 10));
};

/**
 * Apply masking configuration to a data object
 */
export const applyDataMasking = <T extends Record<string, any>>(
  data: T,
  userRole: UserRole,
  config: MaskingConfig[]
): T => {
  const maskedData = { ...data } as any;

  config.forEach(({ field, allowedRoles, maskingStrategy }) => {
    if (!allowedRoles.includes(userRole) && maskedData[field]) {
      const value = String(maskedData[field]);

      switch (maskingStrategy) {
        case 'email':
          maskedData[field] = maskEmail(value, userRole);
          break;
        case 'phone':
          maskedData[field] = maskPhone(value, userRole);
          break;
        case 'partial':
          maskedData[field] = maskPartial(value, userRole);
          break;
        case 'full':
          maskedData[field] = maskFull(value, userRole);
          break;
        case 'none':
        default:
          // No masking
          break;
      }
    }
  });

  return maskedData as T;
};

/**
 * Default masking configuration for common sensitive fields
 */
export const defaultMaskingConfig: MaskingConfig[] = [
  {
    field: 'email',
    allowedRoles: ['admin', 'super_admin'],
    maskingStrategy: 'email',
  },
  {
    field: 'phone',
    allowedRoles: ['admin', 'super_admin'],
    maskingStrategy: 'phone',
  },
  {
    field: 'ssn',
    allowedRoles: ['super_admin'],
    maskingStrategy: 'full',
  },
  {
    field: 'apiKey',
    allowedRoles: ['admin', 'super_admin'],
    maskingStrategy: 'partial',
  },
  {
    field: 'creditCard',
    allowedRoles: ['super_admin'],
    maskingStrategy: 'full',
  },
];
