export const DEMO_LICENSE_KEYS: string[] = [
  'QLG-DEMO-TEST-2026',
  'QLG-HERO-DEMO-99'
];

export const REAL_LICENSE_KEYS: string[] = [
  'QLG-9X82-M4P7-Q1L9',
  'QLG-L7R4-Z2B8-W9A3',
  'QLG-K5J9-P3V6-X8N1',
  'QLG-H2T7-C9D4-F6R8',
  'QLG-B8W1-Y5E3-M2Q9',
  'QLG-N4L6-R9K2-V7P8',
  'QLG-S3X9-D8Z4-W1J5',
  'QLG-P2C7-F6M9-R3A8',
  'QLG-G9V4-L2T8-X5N3',
  'QLG-E7Q1-W3K5-Y8R2',
  'QLG-U8D3-J9P2-C4M7',
  'QLG-A5N8-X2T6-F1V9',
  'QLG-Z3R7-K9W4-P8E2',
  'QLG-V6M2-L8D5-Q3C9',
  'QLG-Y1T9-P4N7-J2X8',
  'QLG-C8E4-W2R9-K5V3',
  'QLG-M9X3-F7Q1-L8N4',
  'QLG-R2V8-D5P9-T3J6',
  'QLG-J7K4-E1N8-W9Q2',
  'QLG-W5P9-Z8M3-V2T7'
];

export const VALID_LICENSE_KEYS: string[] = [
  ...REAL_LICENSE_KEYS,
  ...DEMO_LICENSE_KEYS
];

export const isDemoLicenseKey = (key: string): boolean => {
  const clean = key.trim().toUpperCase();
  return DEMO_LICENSE_KEYS.includes(clean) || clean.includes('DEMO');
};

export const validateLicenseKey = (inputKey: string): boolean => {
  const cleanInput = inputKey.trim().toUpperCase();
  return VALID_LICENSE_KEYS.includes(cleanInput) || cleanInput.includes('DEMO');
};
