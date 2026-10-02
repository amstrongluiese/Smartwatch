import { Router, Request, Response } from 'express';
import { XiaomiHealthKitService } from '../services/xiaomiHealthKitService';
import { db } from '../db/database';
import { config } from '../config/env';

const router = Router();

/**
 * GET /api/xiaomi/connect
 * Starts Xiaomi OAuth flow.
 * Returns official authorization URL with required HealthKit scopes.
 */
router.get('/connect', (req: Request, res: Response) => {
  try {
    const { url, state } = XiaomiHealthKitService.getAuthorizationUrl();

    // If request accepts HTML / browser navigation, we can also redirect directly
    if (req.query.redirect === 'true') {
      return res.redirect(url);
    }

    const isPlaceholder = !config.xiaomiClientId || config.xiaomiClientId === 'xiaomi_capstone_client_dev';

    return res.json({
      success: true,
      authUrl: url,
      state,
      targetDevice: config.targetDeviceName,
      scopes: config.xiaomiHealthScopes,
      redirectUri: config.xiaomiRedirectUri,
      clientId: config.xiaomiClientId,
      isPlaceholderCredentials: isPlaceholder,
    });
  } catch (err: any) {
    console.error('[Route] /api/xiaomi/connect error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/xiaomi/callback
 * Handles Xiaomi OAuth authorization callback.
 * Receives authorization code, exchanges for access token, saves encrypted credentials,
 * synchronizes initial data, and redirects to dashboard.
 */
router.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const error = req.query.error as string;

  if (error) {
    console.error('[Route] Xiaomi OAuth error callback:', error);
    return res.redirect(`${config.clientUrl}?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.status(400).redirect(`${config.clientUrl}?auth_error=missing_code`);
  }

  try {
    console.log(`[Route] Received Xiaomi OAuth code, exchanging for tokens...`);
    const tokenResult = await XiaomiHealthKitService.exchangeAuthorizationCode(code);

    // Synchronize initial HealthKit samples
    await XiaomiHealthKitService.syncHealthData(tokenResult.userId);

    // Redirect back to frontend dashboard with success flag
    return res.redirect(`${config.clientUrl}?auth=success&uid=${tokenResult.xiaomiUserId}`);
  } catch (err: any) {
    console.error('[Route] Callback token exchange failed:', err);
    return res.redirect(`${config.clientUrl}?auth_error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * GET /api/xiaomi/status
 * Returns current Xiaomi connection status, user info, active device, and last sync timestamp.
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const user = await db.getFirstUser();

    if (!user) {
      return res.json({
        connected: false,
        message: 'No Xiaomi account connected.',
        device: null,
      });
    }

    const tokens = await db.getTokens(user.id);
    const hasTokens = !!tokens && !!tokens.access_token_encrypted;
    const devices = await db.getUserDevices(user.id);
    const activeDevice = devices.length > 0 ? devices[0] : null;

    return res.json({
      connected: hasTokens,
      user: {
        id: user.id,
        xiaomiUserId: user.xiaomi_user_id,
        connectedAt: tokens?.created_at || user.created_at,
        tokenExpiresAt: tokens?.expires_at || null,
      },
      device: activeDevice
        ? {
            id: activeDevice.id,
            deviceId: activeDevice.device_id,
            name: activeDevice.device_name,
            type: activeDevice.device_type,
            connectionInfo: activeDevice.connection_info,
            lastSyncTime: activeDevice.last_sync_time,
          }
        : null,
      simulationMode: config.enableSimulationFallback,
    });
  } catch (err: any) {
    console.error('[Route] /api/xiaomi/status error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/xiaomi/sync
 * Requests/synchronizes available health data through the official Xiaomi API.
 * Pulls latest Heart Rate and SpO2.
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    let user = await db.getFirstUser();

    // If no user exists yet and simulation is enabled, initialize a demo user for testing
    if (!user && config.enableSimulationFallback) {
      user = await db.findOrCreateUser('mi_user_9active_demo');
      await XiaomiHealthKitService.exchangeAuthorizationCode('capstone_demo_auth_code');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Please connect a Xiaomi Account first before synchronizing.',
      });
    }

    const syncResult = await XiaomiHealthKitService.syncHealthData(user.id);

    return res.json({
      success: true,
      message: 'Health data synchronized successfully from Xiaomi HealthKit Cloud API.',
      heartRate: syncResult.heartRate,
      spo2: syncResult.spo2,
      syncedCount: syncResult.syncedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Route] /api/xiaomi/sync error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/xiaomi/disconnect
 * Clears stored tokens and disconnects Xiaomi account.
 */
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    const user = await db.getFirstUser();
    if (user) {
      await db.deleteTokens(user.id);
    }
    return res.json({ success: true, message: 'Disconnected Xiaomi Account successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
