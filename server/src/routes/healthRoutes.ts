import { Router, Request, Response } from 'express';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/health/latest
 * Returns latest authorized Heart Rate and SpO2 readings from Xiaomi HealthKit.
 */
router.get('/latest', async (req: Request, res: Response) => {
  try {
    const user = await db.getFirstUser();
    if (!user) {
      return res.json({
        success: true,
        heartRate: null,
        spo2: null,
        message: 'No connected user found.',
      });
    }

    const { heartRate, spo2 } = await db.getLatestHealthData(user.id);
    const devices = await db.getUserDevices(user.id);
    const activeDevice = devices.length > 0 ? devices[0] : null;

    return res.json({
      success: true,
      device: activeDevice?.device_name || 'Xiaomi Smart Band 9 Active',
      source: 'Xiaomi HealthKit',
      heartRate: heartRate
        ? {
            id: heartRate.id,
            dataType: heartRate.data_type,
            value: heartRate.value,
            unit: heartRate.unit,
            timestamp: heartRate.timestamp,
            source: heartRate.source,
          }
        : null,
      spo2: spo2
        ? {
            id: spo2.id,
            dataType: spo2.data_type,
            value: spo2.value,
            unit: spo2.unit,
            timestamp: spo2.timestamp,
            source: spo2.source,
          }
        : null,
    });
  } catch (err: any) {
    console.error('[Route] /api/health/latest error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/health/history
 * Returns historical data points for Heart Rate and SpO2.
 * Supports query params: dataType (e.g. com.xiaomi.heart_rate.delta), limit.
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const user = await db.getFirstUser();
    if (!user) {
      return res.json({ success: true, history: [] });
    }

    const dataType = req.query.dataType as string | undefined;
    const limit = parseInt((req.query.limit as string) || '100', 10);

    const records = await db.getHealthDataHistory(user.id, dataType, limit);

    return res.json({
      success: true,
      count: records.length,
      history: records.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        dataType: r.data_type,
        value: r.value,
        unit: r.unit,
        source: r.source,
        deviceId: r.device_id,
        status: 'Received',
        rawDataReference: r.raw_data_reference,
      })),
    });
  } catch (err: any) {
    console.error('[Route] /api/health/history error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
