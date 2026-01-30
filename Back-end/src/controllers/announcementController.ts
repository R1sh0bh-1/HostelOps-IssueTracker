import { z } from 'zod';
import { AnnouncementModel } from '../models/Announcement';

const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
  hostel: z.string().min(1),
  blocks: z.array(z.string()).min(1, 'At least one block must be selected'),
});

export async function getAnnouncements(req: any, res: any) {
  const allAnnouncements = await AnnouncementModel.find().sort({ createdAt: -1 }).limit(50);

  // Filter announcements based on user's hostel and block
  const userHostel = req.user?.hostel;
  const userBlock = req.user?.block;

  const filteredAnnouncements = allAnnouncements.filter(announcement => {
    // If user doesn't have hostel/block info, show all announcements
    if (!userHostel || !userBlock) return true;

    // Check if announcement targets this user's hostel and block
    return announcement.hostel === userHostel && announcement.blocks.includes(userBlock);
  });

  res.json(filteredAnnouncements.map(a => a.toJSON()));
}

export async function createAnnouncement(req: any, res: any) {
  const data = createAnnouncementSchema.parse(req.body);

  const created = await AnnouncementModel.create({
    title: data.title,
    message: data.message,
    hostel: data.hostel,
    blocks: data.blocks,
    createdBy: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
  });

  res.status(201).json(created.toJSON());
}

