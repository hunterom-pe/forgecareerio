/**
 * Elite Password Strength Engine
 * Calculates a score from 0 to 4 based on complexity.
 */
export function calculatePasswordStrength(password: string) {
  let score = 0;
  if (!password) return { score: 0, label: "None", color: "bg-slate-200", text: "text-slate-400" };

  // 1. Length Check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 0.5; // Bonus for length

  // 2. Character Diversity
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1; // Mixed case
  if (/[0-9]/.test(password)) score += 1; // Numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // Symbols

  // Cap at 4
  const finalScore = Math.min(4, Math.floor(score));

  const levels = [
    { label: "Weak", color: "bg-red-500", text: "text-red-500" },
    { label: "Fair", color: "bg-amber-500", text: "text-amber-500" },
    { label: "Good", color: "bg-blue-500", text: "text-blue-500" },
    { label: "Strong", color: "bg-indigo-600", text: "text-indigo-600" },
    { label: "Elite", color: "bg-emerald-500", text: "text-emerald-500" },
  ];

  return levels[finalScore];
}
