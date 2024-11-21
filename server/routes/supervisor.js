import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { db } from '../database/init.js';

const router = express.Router();

// Get all appraisals for supervisor
router.get('/appraisals', authenticateToken, authorizeRole(['Supervisor']), async (req, res) => {
  try {
    const appraisals = await db.all(`
      SELECT 
        a.*,
        u.firstName || ' ' || u.lastName as employeeName
      FROM appraisals a
      JOIN users u ON a.userId = u.id
      WHERE (
        u.department = (
          SELECT department 
          FROM users 
          WHERE id = ?
        )
      )
      ORDER BY a.createdAt DESC
    `, [req.user.id]);
    
    res.json(appraisals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appraisals' });
  }
});

// Submit feedback for an appraisal
router.post('/feedback/:id', authenticateToken, authorizeRole(['Supervisor']), async (req, res) => {
  const { id } = req.params;
  const { rating, remarks } = req.body;

  try {
    await db.run(`
      UPDATE appraisals 
      SET 
        supervisorId = ?,
        rating = ?,
        supervisorRemarks = ?,
        status = 'reviewed',
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [req.user.id, rating, remarks, id]);

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

// Delete feedback
router.delete('/feedback/:id', authenticateToken, authorizeRole(['Supervisor']), async (req, res) => {
  const { id } = req.params;

  try {
    await db.run(`
      UPDATE appraisals 
      SET 
        supervisorId = NULL,
        rating = NULL,
        supervisorRemarks = NULL,
        status = 'pending',
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting feedback' });
  }
});

export default router;