/**
 * Sanitizes database error messages to prevent leaking internal details
 */
export function mapDatabaseError(error: any): string {
  // Log the full error for debugging (only visible in dev tools)
  console.error('Database error:', error);

  // Map common database error codes to user-friendly messages
  if (error.code === '23505') {
    return 'This record already exists.';
  }
  if (error.code === '23503') {
    return 'Cannot delete this record because it is referenced by other data.';
  }
  if (error.code === '42501') {
    return 'You do not have permission to perform this action.';
  }
  if (error.code === '42P01') {
    return 'A database configuration error occurred.';
  }
  if (error.code === 'PGRST301') {
    return 'You do not have permission to access this resource.';
  }

  // Check for RLS-related errors
  if (error.message?.toLowerCase().includes('row-level security') ||
      error.message?.toLowerCase().includes('rls') ||
      error.message?.toLowerCase().includes('policy')) {
    return 'You do not have permission to perform this action.';
  }

  // Check for authentication errors
  if (error.message?.toLowerCase().includes('not authenticated') ||
      error.message?.toLowerCase().includes('jwt')) {
    return 'Your session has expired. Please sign in again.';
  }

  // Default message for unknown errors
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Sanitizes auth error messages
 */
export function mapAuthError(error: any): string {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please verify your email address.';
  }
  if (message.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (message.includes('password')) {
    return 'Password must be at least 6 characters.';
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please try again later.';
  }

  return 'Authentication failed. Please try again.';
}
