const pool = require('../config/database');

class Transcript {
  static async create(data) {
    const {
      audioFileId,
      transcriptText,
      wordCount = null,
      language = 'en',
      confidenceScore = null
    } = data;

    const query = `
      INSERT INTO transcripts (
        audio_file_id, transcript_text, word_count, language, confidence_score
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [audioFileId, transcriptText, wordCount, language, confidenceScore];
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

  static async update(audioFileId, transcriptText, wordCount = null, confidenceScore = null) {
    const query = `
      UPDATE transcripts
      SET transcript_text = $1, word_count = $2, confidence_score = $3, updated_at = CURRENT_TIMESTAMP
      WHERE audio_file_id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [transcriptText, wordCount, confidenceScore, audioFileId]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM transcripts WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = Transcript;

