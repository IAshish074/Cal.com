const pool = require('../config/db');

exports.getAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const [schedules] = await pool.query('SELECT * FROM availability_schedules WHERE user_id = ? LIMIT 1', [userId]);
    if (schedules.length === 0) return res.json({ slots: [] });
    
    const schedule = schedules[0];
    const [slots] = await pool.query('SELECT * FROM availability_slots WHERE schedule_id = ? ORDER BY day_of_week, start_time', [schedule.id]);
    
    res.json({ schedule, slots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { slots, timezone } = req.body; // slots: [{ day_of_week, start_time, end_time }]
    const userId = req.user.id;
    
    let [schedules] = await pool.query('SELECT * FROM availability_schedules WHERE user_id = ? LIMIT 1', [userId]);
    let scheduleId;
    if (schedules.length === 0) {
      const [insertResult] = await pool.query('INSERT INTO availability_schedules (user_id, name, timezone) VALUES (?, \'Working Hours\', ?)', [userId, timezone || 'UTC']);
      scheduleId = insertResult.insertId;
    } else {
      scheduleId = schedules[0].id;
      await pool.query('UPDATE availability_schedules SET timezone = ? WHERE id = ?', [timezone || schedules[0].timezone, scheduleId]);
    }

    if (slots && slots.length > 0) {
      await pool.query('DELETE FROM availability_slots WHERE schedule_id = ?', [scheduleId]);
      for(let slot of slots) {
        await pool.query(
          'INSERT INTO availability_slots (schedule_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
          [scheduleId, slot.day_of_week, slot.start_time, slot.end_time]
        );
      }
    }
    
    res.json({ message: 'Availability updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
