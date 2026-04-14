const pool = require('../config/db');


exports.getEventTypes = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM event_types WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 
exports.getEventTypeBySlug = async (req, res) => {
  try {
    const { username, slug } = req.params;

    const [rows] = await pool.query(
      `SELECT e.* 
       FROM event_types e 
       JOIN users u ON e.user_id = u.id 
       WHERE u.username = ? AND e.slug = ?`,
      [username, slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createEventType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, duration_minutes, slug } = req.body;

    const [result] = await pool.query(
      `INSERT INTO event_types 
       (user_id, title, description, duration_minutes, slug) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, description, duration_minutes, slug]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      duration_minutes,
      slug
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { title, description, duration_minutes, slug } = req.body;

    const [result] = await pool.query(
      `UPDATE event_types 
       SET title = ?, description = ?, duration_minutes = ?, slug = ? 
       WHERE id = ? AND user_id = ?`,
      [title, description, duration_minutes, slug, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }

    res.json({ message: 'Updated successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM event_types WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }

    res.json({ message: 'Deleted successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};