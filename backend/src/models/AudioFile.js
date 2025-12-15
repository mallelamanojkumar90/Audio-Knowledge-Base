const pool = require('../config/database');

class AudioFile {
  static async create(data) {
    const {
      filename,
      originalFilename,
      filePath,
      fileSize,
      fileType,
      durationSeconds = null,
      status = 'uploaded',
      transcriptionJobId = null
    } = data;

    const query = `
      INSERT INTO audio_files (
        filename, original_filename, file_path, file_size, file_type,
        duration_seconds, status, transcription_job_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      filename,
      originalFilename,
      filePath,
      fileSize,
      fileType,
      durationSeconds,
      status,
      transcriptionJobId
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM audio_files WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll() {
    const query = 'SELECT * FROM audio_files ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateStatus(id, status, transcriptionJobId = null) {
    const query = `
      UPDATE audio_files
      SET status = $1, transcription_job_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [status, transcriptionJobId, id]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM audio_files WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = AudioFile;

