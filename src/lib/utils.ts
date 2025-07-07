import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma lista de recursos em português, com vírgulas, espaço após vírgula e 'e' antes do último item.
 * Exemplo: ['A', 'B', 'C'] => 'A, B e C'
 */
export function formatarRecursosPT(recursos: string[]): string {
  if (!recursos || recursos.length === 0) return '';
  if (recursos.length === 1) return recursos[0];
  if (recursos.length === 2) return recursos.join(' e ');
  return recursos.slice(0, -1).join(', ') + ' e ' + recursos[recursos.length - 1];
}
