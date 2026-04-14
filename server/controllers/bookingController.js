const pool = require('../config/db');

exports.getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT b.*, e.title as event_title 
      FROM bookings b
      JOIN event_types e ON b.event_type_id = e.id
      WHERE e.user_id = ?
      ORDER BY b.start_time DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await pool.query(`
      UPDATE bookings b
      JOIN event_types e ON b.event_type_id = e.id
      SET b.status = "cancelled" 
      WHERE b.id = ? AND e.user_id = ?
    `, [id, userId]);
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { event_type_id, booker_name, booker_email, start_time, end_time } = req.body;
    
    // Check for double booking (no overlapping boundaries where bookings are active)
    const [existing] = await pool.query(`
      SELECT * FROM bookings 
      WHERE event_type_id = ? AND status != 'cancelled'
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?)
      )
    `, [event_type_id, start_time, start_time, end_time, end_time]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Time slot is already booked.' });
    }

    await pool.query(`
      INSERT INTO bookings (event_type_id, booker_name, booker_email, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `, [event_type_id, booker_name, booker_email, start_time, end_time]);

    res.status(201).json({ message: 'Booking successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generates time slots for a specific date and event type
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { username, slug, date } = req.query; // date in YYYY-MM-DD
    
    // 1. Get event type
    const [eventTypes] = await pool.query(
      'SELECT e.* FROM event_types e JOIN users u ON e.user_id = u.id WHERE u.username = ? AND e.slug = ?',
      [username, slug]
    );
    if (eventTypes.length === 0) return res.status(404).json({ error: 'Event type not found' });
    const eventType = eventTypes[0];
    
    // 2. Get schedule slots for that day of week
    // JS getDay(): 0=Sun, 1=Mon. Our definition might differ but let's use JS convention (0-6)
    // Actually, SQL also has WEEKDAY() but let's calculate day in JS based on UTC for simplicity.
    const targetDate = new Date(date + 'T00:00:00Z'); 
    const dayOfWeek = (targetDate.getUTCDay() + 6) % 7; // Convert 0=Sun,1=Mon to 0=Mon, 6=Sun like standard
    
    const [schedules] = await pool.query('SELECT * FROM availability_schedules WHERE user_id = ? LIMIT 1', [eventType.user_id]);
    if (schedules.length === 0) return res.json({ slots: [] });
    const schedule = schedules[0];
    
    const [daySlots] = await pool.query('SELECT * FROM availability_slots WHERE schedule_id = ? AND day_of_week = ?', [schedule.id, dayOfWeek]);
    
    // 3. Get existing bookings for that day
    const [bookings] = await pool.query(`
      SELECT * FROM bookings 
      WHERE event_type_id = ? AND status != 'cancelled'
      AND DATE(start_time) = ?
    `, [eventType.id, date]);

    // 4. Generate candidate slots
    const availableSlots = [];
    const durationMs = eventType.duration_minutes * 60 * 1000;

    for (let slot of daySlots) {
      const [startH, startM] = slot.start_time.split(':');
      const [endH, endM] = slot.end_time.split(':');
      
      let currentMs = new Date(`${date}T${startH}:${startM}:00Z`).getTime();
      const endMs = new Date(`${date}T${endH}:${endM}:00Z`).getTime();
      
      while (currentMs + durationMs <= endMs) {
        let slotStart = currentMs;
        let slotEnd = currentMs + durationMs;
        
        // conflict check
        let conflict = bookings.some(b => {
          let bStart = new Date(b.start_time).getTime();
          let bEnd = new Date(b.end_time).getTime();
          return (slotStart < bEnd && slotEnd > bStart);
        });

        if (!conflict) {
          availableSlots.push(new Date(slotStart).toISOString());
        }
        
        currentMs += durationMs; // jump by duration_minutes. Or just 15 mins? Cal.com usually jumps by duration_minutes.
      }
    }

    res.json({ slots: availableSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
