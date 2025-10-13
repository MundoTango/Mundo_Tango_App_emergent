import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';
import { z } from 'zod';

const router = Router();

const bookingSchema = z.object({
  listingId: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  guests: z.number(),
  totalPrice: z.number(),
});

// Create booking
router.post('/bookings', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const validatedData = bookingSchema.parse(req.body);
    const booking = await storage.createBooking(Number(userId), validatedData);
    res.json({ success: true, data: booking });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
router.get('/bookings', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const bookings = await storage.getUserBookings(Number(userId));
    res.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get specific booking
router.get('/bookings/:id', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const bookingId = parseInt(req.params.id);
    const booking = await storage.getBooking(bookingId, Number(userId));
    res.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

export default router;
