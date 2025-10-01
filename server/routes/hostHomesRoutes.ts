import { Router } from 'express';
import { db } from '../db';
import { hostHomes, users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';

const router = Router();

// Get host homes (optionally filtered by city)
router.get('/api/host-homes', setUserContext, async (req, res) => {
  try {
    const { city, country, groupSlug } = req.query;
    
    // Build where conditions
    let whereConditions = [eq(hostHomes.isActive, true)];
    
    if (city && typeof city === 'string') {
      whereConditions.push(sql`LOWER(${hostHomes.city}) = LOWER(${city})`);
    }
    
    if (country && typeof country === 'string') {
      whereConditions.push(sql`LOWER(${hostHomes.country}) = LOWER(${country})`);
    }
    
    const homes = await db
      .select({
        id: hostHomes.id,
        hostId: hostHomes.hostId,
        title: hostHomes.title,
        description: hostHomes.description,
        address: hostHomes.address,
        city: hostHomes.city,
        state: hostHomes.state,
        country: hostHomes.country,
        lat: hostHomes.lat,
        lng: hostHomes.lng,
        pricePerNight: hostHomes.pricePerNight,
        maxGuests: hostHomes.maxGuests,
        amenities: hostHomes.amenities,
        photos: hostHomes.photos,
        availability: hostHomes.availability,
        isActive: hostHomes.isActive,
        createdAt: hostHomes.createdAt,
        host: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage
        }
      })
      .from(hostHomes)
      .innerJoin(users, eq(users.id, hostHomes.hostId))
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]);
    
    res.json({
      success: true,
      data: homes
    });
  } catch (error) {
    console.error('Error fetching host homes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch host homes' });
  }
});

// Get single host home by ID
router.get('/api/host-homes/:id', setUserContext, async (req, res) => {
  try {
    const homeId = parseInt(req.params.id);
    
    const [home] = await db
      .select({
        id: hostHomes.id,
        hostId: hostHomes.hostId,
        title: hostHomes.title,
        description: hostHomes.description,
        address: hostHomes.address,
        city: hostHomes.city,
        state: hostHomes.state,
        country: hostHomes.country,
        lat: hostHomes.lat,
        lng: hostHomes.lng,
        pricePerNight: hostHomes.pricePerNight,
        maxGuests: hostHomes.maxGuests,
        amenities: hostHomes.amenities,
        photos: hostHomes.photos,
        availability: hostHomes.availability,
        isActive: hostHomes.isActive,
        createdAt: hostHomes.createdAt,
        host: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          email: users.email
        }
      })
      .from(hostHomes)
      .innerJoin(users, eq(users.id, hostHomes.hostId))
      .where(and(
        eq(hostHomes.id, homeId),
        eq(hostHomes.isActive, true)
      ));
    
    if (!home) {
      return res.status(404).json({ success: false, error: 'Host home not found' });
    }
    
    res.json({
      success: true,
      data: home
    });
  } catch (error) {
    console.error('Error fetching host home:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch host home' });
  }
});

export default router;
