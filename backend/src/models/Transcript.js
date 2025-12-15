const pool = require('../config/database');

class Transcript {
  static async create(data) {
    const {
      audioFileId,
      transcriptText,
      wordCount = null,
      language = 'en'
    } = data;

    const query = `
      INSERT INTO transcripts (
        audio_file_id, transcript_text, word_count, language
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [audioFileId, transcriptText, wordCount, language];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByAudioFileId(audioFileId) {
    const query = 'SELECT * FROM transcripts WHERE audio_file_id = $1';
    const result = await pool.query(query, [audioFileId]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM transcripts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async update(audioFileId, transcriptText, wordCount = null) {
    const query = `
      UPDATE transcripts
      SET transcript_text = $1, word_count = $2, updated_at = CURRENT_TIMESTAMP
      WHERE audio_file_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [transcriptText, wordCount, audioFileId]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM transcripts WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = Transcript;

