import pool from '../config/db.config.js';

class UserModel {
  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, role, is_verified, status, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  async findUserWithProfile(id) {
    const [userRows] = await pool.execute(
      'SELECT id, email, role, is_verified, status FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    const user = userRows[0];
    if (!user) return null;

    if (user.role === 'student') {
      const [studentRows] = await pool.execute('SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
      user.profile = studentRows[0] || null;
    } else if (user.role === 'employer') {
      const [employerRows] = await pool.execute('SELECT * FROM employers WHERE id = ? LIMIT 1', [id]);
      user.profile = employerRows[0] || null;
    } else if (user.role === 'admin') {
      const [adminRows] = await pool.execute('SELECT * FROM admins WHERE id = ? LIMIT 1', [id]);
      user.profile = adminRows[0] || null;
    }
    return user;
  }

  async createUserWithProfile(userData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert into users
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password_hash, role, is_verified) VALUES (?, ?, ?, ?)',
        [userData.email, userData.passwordHash, userData.role, userData.isVerified || false]
      );
      const userId = userResult.insertId;

      // Insert role-specific profile details
      if (userData.role === 'student') {
        await connection.execute(
          'INSERT INTO students (id, first_name, last_name, phone) VALUES (?, ?, ?, ?)',
          [userId, userData.firstName, userData.lastName, userData.phone || null]
        );
      } else if (userData.role === 'employer') {
        await connection.execute(
          'INSERT INTO employers (id, company_name, contact_phone) VALUES (?, ?, ?)',
          [userId, userData.companyName, userData.phone || null]
        );
      } else if (userData.role === 'admin') {
        await connection.execute(
          'INSERT INTO admins (id, full_name, phone) VALUES (?, ?, ?)',
          [userId, userData.fullName, userData.phone || null]
        );
      }

      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateVerificationStatus(userId, isVerified) {
    await pool.execute('UPDATE users SET is_verified = ? WHERE id = ?', [isVerified ? 1 : 0, userId]);
  }

  async updatePassword(userId, passwordHash) {
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
  }

  // Refresh Token operations
  async createRefreshToken(userId, token, expiresAt) {
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }

  async findRefreshToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? AND revoked_at IS NULL LIMIT 1',
      [token]
    );
    return rows[0] || null;
  }

  async revokeRefreshToken(token) {
    await pool.execute(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = ?',
      [token]
    );
  }

  async deleteRefreshTokensByUserId(userId) {
    await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }

  // Password Reset Token operations
  async createPasswordResetToken(userId, token, expiresAt) {
    await pool.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }

  async findPasswordResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used_at IS NULL LIMIT 1',
      [token]
    );
    return rows[0] || null;
  }

  async markPasswordResetTokenUsed(token) {
    await pool.execute(
      'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?',
      [token]
    );
  }

  // Email Verification Token operations
  async createEmailVerificationToken(userId, token, expiresAt) {
    await pool.execute(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }

  async findEmailVerificationToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM email_verification_tokens WHERE token = ? LIMIT 1',
      [token]
    );
    return rows[0] || null;
  }

  async deleteEmailVerificationToken(token) {
    await pool.execute('DELETE FROM email_verification_tokens WHERE token = ?', [token]);
  }
}

export default new UserModel();
