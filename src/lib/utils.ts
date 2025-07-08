
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

/**
 * Normaliza e limpa uma string de recursos, removendo caracteres especiais e espaços extras
 */
export function normalizarRecursos(recursos: string | string[]): string[] {
  if (!recursos) return [];
  
  if (typeof recursos === 'string') {
    return recursos
      .split(/[,;]|e(?=\s)/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
  }
  
  if (Array.isArray(recursos)) {
    return recursos
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
  }
  
  return [];
}

/**
 * Limpa e normaliza recursos específicos de uma etapa de plano de aula
 */
export function limparRecursosEtapa(recursos: string): string {
  if (!recursos || typeof recursos !== 'string') return '';
  
  // Remove caracteres fragmentados e normaliza
  return recursos
    .replace(/,\s*,/g, ',') // Remove vírgulas duplas
    .replace(/\s+/g, ' ') // Normaliza espaços
    .replace(/([a-z]),\s*([A-Z])/g, '$1, $2') // Garante espaço após vírgula
    .trim();
}
