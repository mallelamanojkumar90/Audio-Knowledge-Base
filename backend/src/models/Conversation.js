const pool = require('../config/database');

class Conversation {
  static async create(data) {
    const { audioFileId, title = null } = data;

    const query = `
      INSERT INTO conversations (audio_file_id, title)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(query, [audioFileId, title]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM conversations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByAudioFileId(audioFileId) {
    const query = `
      SELECT * FROM conversations
      WHERE audio_file_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [audioFileId]);
    return result.rows;
  }

  static async update(id, title) {
    const query = `
      UPDATE conversations
      SET title = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [title, id]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM conversations WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = Conversation;

