import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user-owned data across entities
    const [healthLogs, labResults, journalEntries, journalSettings, deviceConnections] = await Promise.all([
      base44.entities.HealthLog.filter({ created_by: user.email }),
      base44.entities.LabResult.filter({ created_by: user.email }),
      base44.entities.JournalEntry.filter({ created_by: user.email }),
      base44.entities.JournalSettings.filter({ created_by: user.email }),
      base44.entities.DeviceConnection.filter({ created_by: user.email }),
    ]);

    // Delete all records concurrently
    const deletePromises = [
      ...healthLogs.map(r => base44.entities.HealthLog.delete(r.id)),
      ...labResults.map(r => base44.entities.LabResult.delete(r.id)),
      ...journalEntries.map(r => base44.entities.JournalEntry.delete(r.id)),
      ...journalSettings.map(r => base44.entities.JournalSettings.delete(r.id)),
      ...deviceConnections.map(r => base44.entities.DeviceConnection.delete(r.id)),
    ];

    await Promise.all(deletePromises);

    // Delete the user account itself via service role
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});