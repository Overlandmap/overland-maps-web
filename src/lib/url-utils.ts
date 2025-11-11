/**
 * Get the base path from environment configuration
 * @returns The basePath string (e.g., '/out') or empty string if no basePath
 */
function getBasePath(): string {
  // Read from environment variable set at build time
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

/**
 * Generate a URL path for a given entity type and ID
 * @param type - The entity type ('country', 'border', 'border_post')
 * @param id - The entity identifier
 * @returns The complete URL path including basePath, with no double slashes
 */
export function generateEntityUrl(
  type: 'country' | 'border' | 'border_post',
  id: string
): string {
  // Handle edge cases: undefined or empty values
  if (!id) {
    id = '';
  }

  const basePath = getBasePath();
  const routePath = `/${type}/${id}`;
  
  // Ensure no double slashes when combining basePath and routePath
  if (basePath) {
    // basePath already starts with '/', routePath starts with '/'
    // So we need to avoid double slash
    return `${basePath}${routePath}`;
  }
  
  return routePath;
}
