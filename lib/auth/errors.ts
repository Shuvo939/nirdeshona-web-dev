export function friendlyAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email address first — check your inbox.";
  if (m.includes("user already registered")) return "An account with this email already exists. Try logging in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("password should be")) return "Password must be at least 8 characters long.";
  return message;
}
