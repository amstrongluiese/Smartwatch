import { db, InsertApiLog } from '../db/database';
import { maskSensitive } from './cryptoService';

export class ApiLogService {
  /**
   * Sanitizes and logs an outgoing/incoming Xiaomi API request & response.
   * Ensures zero secrets, tokens, or auth codes are preserved in the database.
   */
  public static async logApiResponse(params: {
    userId?: number | null;
    endpoint: string;
    httpStatus: number;
    responseTimeMs: number;
    dataType?: string | null;
    rawResponse: any;
  }): Promise<void> {
    try {
      const sanitized = maskSensitive(params.rawResponse);
      const sanitizedJson = typeof sanitized === 'string' 
        ? sanitized 
        : JSON.stringify(sanitized, null, 2);

      const logEntry: InsertApiLog = {
        user_id: params.userId || null,
        endpoint: params.endpoint,
        http_status: params.httpStatus,
        response_time_ms: params.responseTimeMs,
        data_type: params.dataType || null,
        sanitized_response: sanitizedJson,
      };

      await db.insertApiLog(logEntry);
    } catch (err: any) {
      console.error('[ApiLogService] Failed to record sanitized API log:', err.message);
    }
  }

  public static async getLogs(limit: number = 50) {
    return db.getApiLogs(limit);
  }

  public static async clearLogs() {
    return db.clearApiLogs();
  }
}
