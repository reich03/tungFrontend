import { REGEX, PLAYER } from '../config/app.config';

export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    return REGEX.EMAIL.test(email.trim());
  }

  static isValidPhone(phone: string): boolean {
    return REGEX.PHONE_COLOMBIA.test(phone.trim());
  }

  static isValidDocument(document: string): boolean {
    const trimmed = document.trim();
    return trimmed.length >= PLAYER.VALIDATION.MIN_DOCUMENT_LENGTH &&
           trimmed.length <= PLAYER.VALIDATION.MAX_DOCUMENT_LENGTH &&
           REGEX.DOCUMENT_NUMBER.test(trimmed);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= PLAYER.VALIDATION.MIN_PASSWORD_LENGTH;
  }

  static isValidAge(birthDate: Date): boolean {
    const age = this.calculateAge(birthDate);
    return age >= PLAYER.VALIDATION.MIN_AGE && age <= PLAYER.VALIDATION.MAX_AGE;
  }

  static isValidHeight(height: number): boolean {
    return height >= PLAYER.VALIDATION.MIN_HEIGHT && height <= PLAYER.VALIDATION.MAX_HEIGHT;
  }

  static isValidWeight(weight: number): boolean {
    return weight >= PLAYER.VALIDATION.MIN_WEIGHT && weight <= PLAYER.VALIDATION.MAX_WEIGHT;
  }

  static calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  static formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static formatPhoneForDisplay(phone: string): string {
    if (phone.length === 10) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    return phone;
  }

  static isValidNickname(nickname: string): boolean {
    const trimmed = nickname.trim();
    return trimmed.length >= 3 && trimmed.length <= 20 && /^[a-zA-Z0-9_]+$/.test(trimmed);
  }

  static isValidName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed);
  }
}

import { ERRORS } from '../config/app.config';

export class ErrorUtils {
  static parseApiError(error: any): string {
    if (!error) return ERRORS.UNKNOWN;

    const errorMessage = error.message || error.toString();

    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      return ERRORS.NETWORK;
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      return ERRORS.TIMEOUT;
    }

    if (errorMessage.includes('400')) {
      return ERRORS.VALIDATION;
    }

    if (errorMessage.includes('401')) {
      return ERRORS.UNAUTHORIZED;
    }

    if (errorMessage.includes('409')) {
      return ERRORS.DUPLICATE;
    }

    if (errorMessage.includes('500')) {
      return ERRORS.SERVER;
    }

    if (errorMessage.length < 100 && !errorMessage.includes('HTTP')) {
      return errorMessage;
    }

    return ERRORS.UNKNOWN;
  }

  static logError(error: any, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';

    console.error(`${timestamp} ${contextStr} Error:`, error);

  
  }

  static createUserError(message: string, code?: string): Error {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }
}

export class FormatUtils {
  static formatDocument(document: string, type: string): string {
    if (type === 'cedula' && document.length >= 7) {
      return document.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return document;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  static formatTime(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static formatStats(stats: Record<string, number>): string {
    const total = Object.values(stats).reduce((sum, value) => sum + value, 0);
    return `${total}/360`;
  }
}

export class AsyncUtils {
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string = 'Operation timed out'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}

export class ImageUtils {
  static isValidImageUri(uri: string): boolean {
    if (!uri) return false;

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const lowerUri = uri.toLowerCase();

    return imageExtensions.some(ext => lowerUri.includes(ext)) ||
           lowerUri.startsWith('data:image/') ||
           lowerUri.startsWith('file://') ||
           lowerUri.startsWith('content://');
  }

  static getImageExtension(uri: string): string {
    const match = uri.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    return match ? match[1].toLowerCase() : 'jpg';
  }

  static generateImageFilename(prefix: string = 'image'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.jpg`;
  }

  static getOptimalQuality(uri: string): number {
    return 0.8;
  }
}

export {
  ValidationUtils,
  ErrorUtils,
  FormatUtils,
  AsyncUtils,
  ImageUtils,
};