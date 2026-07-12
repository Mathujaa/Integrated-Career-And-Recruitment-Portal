import pool from '../config/db.config.js';

class LogModel {
  async createActivityLog(userId, action, ipAddress, userAgent) {
    try {
      await pool.execute(
        'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [userId || null, action, ipAddress || '127.0.0.1', userAgent || 'Unknown']
      );
    } catch (error) {
      console.error('Failed to write activity log:', error);
    }
  }

  async createLoginLog(userId, ipAddress, userAgent, status, failureReason) {
    try {
      await pool.execute(
        'INSERT INTO login_logs (user_id, ip_address, user_agent, login_status, failure_reason) VALUES (?, ?, ?, ?, ?)',
        [userId, ipAddress || '127.0.0.1', userAgent || 'Unknown', status, failureReason || null]
      );
    } catch (error) {
      console.error('Failed to write login log:', error);
    }
  }
}

export default new LogModel();
