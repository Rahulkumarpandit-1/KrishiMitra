const { db } = require('../config/db');

function generateNotificationsForUser(userId) {
  const alerts = [];

  // Check upcoming calendar events (next 3 days)
  const upcoming = db.prepare(`
    SELECT cal.*, fc.user_id, c.name as crop_name
    FROM farming_calendar cal
    JOIN farmer_crops fc ON cal.farmer_crop_id = fc.id
    JOIN crops c ON fc.crop_id = c.id
    WHERE fc.user_id = ? AND cal.status = 'pending'
    AND cal.scheduled_date BETWEEN date('now') AND date('now', '+3 days')
  `).all(userId);

  for (const event of upcoming) {
    alerts.push({
      user_id: userId,
      category: 'calendar',
      title: `Upcoming: ${event.title}`,
      message: `${event.description} (Scheduled: ${event.scheduled_date})`,
      priority: 'normal'
    });
  }

  // Check overdue calendar events
  const overdue = db.prepare(`
    SELECT cal.*, c.name as crop_name
    FROM farming_calendar cal
    JOIN farmer_crops fc ON cal.farmer_crop_id = fc.id
    JOIN crops c ON fc.crop_id = c.id
    WHERE fc.user_id = ? AND cal.status = 'pending'
    AND cal.scheduled_date < date('now')
  `).all(userId);

  for (const event of overdue) {
    alerts.push({
      user_id: userId,
      category: 'calendar',
      title: `Overdue: ${event.title}`,
      message: `This activity was scheduled for ${event.scheduled_date}. Please complete or skip it.`,
      priority: 'high'
    });
  }

  // Store alerts
  if (alerts.length > 0) {
    const insert = db.prepare(
      'INSERT INTO notifications (user_id, category, title, message, priority) VALUES (?, ?, ?, ?, ?)'
    );
    const insertAll = db.transaction((alerts) => {
      for (const alert of alerts) {
        insert.run(alert.user_id, alert.category, alert.title, alert.message, alert.priority);
      }
    });
    insertAll(alerts);
  }

  return alerts;
}

module.exports = { generateNotificationsForUser };
