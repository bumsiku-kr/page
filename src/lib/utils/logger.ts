/**
 * 환경별 로깅 시스템
 * - Development: 모든 로그 출력
 * - Production: error/warn만 출력
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: unknown): void {
    // Production에서는 debug/info 로그 스킵
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    const consoleMethod = level === 'debug' ? 'log' : level;

    if (data !== undefined) {
      console[consoleMethod](`${prefix} ${message}`, data);
    } else {
      console[consoleMethod](`${prefix} ${message}`);
    }
  }

  /**
   * 디버그 로그 (개발 환경에서만 출력)
   */
  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  /**
   * 정보 로그 (개발 환경에서만 출력)
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  /**
   * 경고 로그 (모든 환경에서 출력)
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  /**
   * 에러 로그 (모든 환경에서 출력)
   */
  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }
}

export const logger = new Logger();
