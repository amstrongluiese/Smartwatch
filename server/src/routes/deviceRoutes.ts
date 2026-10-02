import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { XiaomiHealthKitService } from '../services/xiaomiHealthKitService';

const router = Router();

/**
 * GET /api/devices
 * Returns connected devices authorized through Xiaomi Account.
 * Identifies Xiaomi Smart Band 9 Active and highlights cloud-to-cloud sync pipeline.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = await db.getFirstUser();
    if (!user) {
      return res.json({
        success: true,
        devices: [],
        note: 'No connected Xiaomi devices. Please connect your Xiaomi Account.',
      });
    }

    const devices = await XiaomiHealthKitService.getUserDevices(user.id);

    return res.json({
      success: true,
      devices: devices.map((d) => ({
        id: d.id,
        deviceId: d.device_id,
        deviceName: d.device_name,
        deviceType: d.device_type,
        connectionInfo: d.connection_info || 'Mi Fitness Cloud Sync (Cloud-to-Cloud)',
        lastSyncTime: d.last_sync_time,
        directBluetooth: false, // Explicitly confirms no direct BLE
        pipeline: 'Xiaomi Smart Band 9 Active → Mi Fitness App → Xiaomi HealthKit Cloud → Web Backend',
      })),
    });
  } catch (err: any) {
    console.error('[Route] /api/devices error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
