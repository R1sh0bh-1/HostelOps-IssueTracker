import mongoose from 'mongoose';
import { StaffModel } from '../models/Staff';
import { env } from '../config/env';

const staffData = [
    {
        name: 'Rajesh Kumar',
        email: 'rajesh.plumber@hostel.com',
        phone: '+91-9876543210',
        specialty: 'plumbing',
        hostel: 'Boys Hostel A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
        isActive: true,
    },
    {
        name: 'Amit Sharma',
        email: 'amit.electrician@hostel.com',
        phone: '+91-9876543211',
        specialty: 'electrical',
        hostel: 'Boys Hostel B',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
        isActive: true,
    },
    {
        name: 'Suresh Patel',
        email: 'suresh.internet@hostel.com',
        phone: '+91-9876543212',
        specialty: 'internet',
        hostel: 'All',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
        isActive: true,
    },
    {
        name: 'Ramesh Singh',
        email: 'ramesh.cleaner@hostel.com',
        phone: '+91-9876543213',
        specialty: 'cleanliness',
        hostel: 'Girls Hostel A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh',
        isActive: true,
    },
    {
        name: 'Vijay Verma',
        email: 'vijay.carpenter@hostel.com',
        phone: '+91-9876543214',
        specialty: 'furniture',
        hostel: 'Boys Hostel A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vijay',
        isActive: true,
    },
    {
        name: 'Prakash Yadav',
        email: 'prakash.security@hostel.com',
        phone: '+91-9876543215',
        specialty: 'security',
        hostel: 'All',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prakash',
        isActive: true,
    },
    {
        name: 'Dinesh Gupta',
        email: 'dinesh.maintenance@hostel.com',
        phone: '+91-9876543216',
        specialty: 'other',
        hostel: 'Girls Hostel B',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dinesh',
        isActive: true,
    },
];

async function seedStaff() {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing staff
        await StaffModel.deleteMany({});
        console.log('Cleared existing staff data');

        // Insert seed data
        const inserted = await StaffModel.insertMany(staffData);
        console.log(`✅ Successfully seeded ${inserted.length} staff members:`);

        inserted.forEach(staff => {
            console.log(`  - ${staff.name} (${staff.specialty}) - ${staff.hostel}`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding staff:', error);
        process.exit(1);
    }
}

seedStaff();
