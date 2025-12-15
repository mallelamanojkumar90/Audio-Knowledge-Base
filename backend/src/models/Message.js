const pool = require('../config/database');

class Message {
  static async create(data) {
    const {
      conversationId,
      role,
      content,
      contextSections = null
    } = data;

    const query = `
      INSERT INTO messages (conversation_id, role, content, context_sections)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      conversationId,
      role,
      content,
      contextSections
    ]);
    return result.rows[0];
  }

  static async findByConversationId(conversationId) {
    const query = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [conversationId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = Message;

