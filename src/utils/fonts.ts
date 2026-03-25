/**
 * Font utility functions for language-specific typography
 */

/**
 * Get the appropriate font family based on language
 * @param locale - The current locale ('ar' for Arabic, 'en' for English)
 * @returns CSS font-family string
 */
export const getFontFamily = (locale: 'ar' | 'en'): string => {
  return locale === 'ar' 
    ? '"Tajawal", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
};

/**
 * Get the appropriate font weight based on language and desired weight
 * @param locale - The current locale ('ar' for Arabic, 'en' for English)
 * @param weight - The desired font weight ('400', '500', '600', '700')
 * @returns CSS font-weight value
 */
export const getFontWeight = (locale: 'ar' | 'en', weight: '400' | '500' | '600' | '700'): string => {
  // Tajawal supports 400, 500, 700
  // Inter supports 400, 500, 600, 700
  if (locale === 'ar') {
    // Map 600 to 700 for Tajawal since it doesn't have 600
    return weight === '600' ? '700' : weight;
  }
  return weight;
};

/**
 * Get CSS custom properties for font configuration
 * @param locale - The current locale ('ar' for Arabic, 'en' for English)
 * @returns CSS custom properties object
 */
export const getFontCSSProperties = (locale: 'ar' | 'en') => {
  return {
    '--font-family': getFontFamily(locale),
    '--font-weight-normal': getFontWeight(locale, '400'),
    '--font-weight-medium': getFontWeight(locale, '500'),
    '--font-weight-semibold': getFontWeight(locale, '600'),
    '--font-weight-bold': getFontWeight(locale, '700'),
  };
};
