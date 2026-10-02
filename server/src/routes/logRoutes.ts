import { Router, Request, Response } from 'express';
import { ApiLogService } from '../services/apiLogService';

const router = Router();

/**
 * GET /api/logs
 * Returns sanitized Xiaomi API response logs for capstone monitoring.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const logs = await ApiLogService.getLogs(limit);

    return res.json({
      success: true,
      count: logs.length,
      logs: logs.map((log) => ({
        id: log.id,
        requestTime: log.created_at,
        endpoint: log.endpoint,
        httpStatus: log.http_status,
        responseTimeMs: log.response_time_ms,
        dataType: log.data_type,
        sanitizedResponse: (() => {
          try {
            return JSON.parse(log.sanitized_response);
          } catch {
            return log.sanitized_response;
          }
        })(),
      })),
    });
  } catch (err: any) {
    console.error('[Route] /api/logs error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/logs
 * Clears logged responses.
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    await ApiLogService.clearLogs();
    return res.json({ success: true, message: 'API logs cleared.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
