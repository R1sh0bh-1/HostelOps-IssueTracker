import { z } from 'zod';
import { StaffModel } from '../models/Staff';
import { HttpError } from '../utils/httpError';

const createStaffSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    specialty: z.enum(['plumbing', 'electrical', 'internet', 'cleanliness', 'furniture', 'security', 'other']),
    hostel: z.string().min(1),
    avatar: z.string().url().optional(),
});

export async function getAllStaff(_req: any, res: any) {
    const staff = await StaffModel.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(staff.map(s => s.toJSON()));
}

export async function getStaffByCategory(req: any, res: any) {
    const { category } = req.params;
    const staff = await StaffModel.find({
        specialty: category,
        isActive: true
    }).sort({ name: 1 });
    res.json(staff.map(s => s.toJSON()));
}

export async function createStaff(req: any, res: any) {
    const data = createStaffSchema.parse(req.body);

    const created = await StaffModel.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        hostel: data.hostel,
        avatar: data.avatar,
        isActive: true,
    });

    res.status(201).json(created.toJSON());
}

export async function deleteStaff(req: any, res: any) {
    const staff = await StaffModel.findById(req.params.id);
    if (!staff) throw new HttpError(404, 'Staff member not found');

    // Soft delete
    staff.isActive = false;
    await staff.save();

    res.status(204).send();
}
