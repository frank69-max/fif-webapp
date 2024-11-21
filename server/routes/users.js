import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { db } from '../database/init.js';

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, profileImage } = req.body;
    await db.run(
      `UPDATE users SET firstName = ?, lastName = ?, profileImage = ? WHERE id = ?`,
      [firstName, lastName, profileImage, req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

router.post('/appraisal', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    await db.run(
      `INSERT INTO appraisals (userId, content) VALUES (?, ?)`,
      [req.user.id, content]
    );
    res.status(201).json({ message: 'Appraisal submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting appraisal' });
  }
});

router.get('/appraisals', authenticateToken, async (req, res) => {
  try {
    const appraisals = await db.all(
      `SELECT * FROM appraisals WHERE userId = ? ORDER BY createdAt DESC`,
      [req.user.id]
    );
    res.json(appraisals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appraisals' });
  }
});

export default router;