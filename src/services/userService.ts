import { User, UserRole } from '@/types';
import { readJsonData, writeJsonData } from '@/lib/json-db';
import { connectToDatabase, MongoUser } from '@/lib/mongodb';

export class UserService {
  private static FILENAME = 'users.json';

  static async getUsers(): Promise<User[]> {
    const superEmail = 'shrikrishna24@navgurukul.org';

    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        let mongoUsers = await MongoUser.find().sort({ createdAt: -1 }).lean();
        
        const hasSuperAdmin = mongoUsers.some(
          (u: any) => u.email.toLowerCase() === superEmail.toLowerCase()
        );

        if (!hasSuperAdmin) {
          const id = `usr_${Date.now()}`;
          await MongoUser.create({
            id,
            name: 'Shrikrishna',
            email: superEmail,
            role: 'admin',
          });
          mongoUsers = await MongoUser.find().sort({ createdAt: -1 }).lean();
        }

        return mongoUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as UserRole,
          avatarUrl: u.avatarUrl || '',
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('MongoDB failed in getUsers. Falling back to JSON database:', err);
      }
    }

    let users = await readJsonData<User[]>(this.FILENAME);
    const hasSuperAdmin = users.some(
      (u) => u.email.toLowerCase() === superEmail.toLowerCase()
    );

    if (!hasSuperAdmin) {
      const newSuper: User = {
        id: `usr_${Date.now()}`,
        name: 'Shrikrishna',
        email: superEmail,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(newSuper);
      await writeJsonData(this.FILENAME, users);
    }

    return users;
  }


  static async assignRole(email: string, role: UserRole): Promise<User> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        let user: any = await MongoUser.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).lean();
        
        if (user) {
          const updated = await MongoUser.findOneAndUpdate(
            { id: user.id },
            { $set: { role } },
            { new: true }
          ).lean();
          return {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role as UserRole,
            avatarUrl: updated.avatarUrl || '',
            createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString(),
          };
        } else {
          const id = `usr_${Date.now()}`;
          const newUser = new MongoUser({
            id,
            name: email.split('@')[0].replace('.', ' '),
            email,
            role,
          });
          const saved = await newUser.save();
          return {
            id,
            name: saved.name,
            email: saved.email,
            role: saved.role as UserRole,
            avatarUrl: saved.avatarUrl || '',
            createdAt: saved.createdAt ? new Date(saved.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: saved.updatedAt ? new Date(saved.updatedAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('MongoDB failed in assignRole. Falling back to JSON database:', err);
      }
    }

    const users = await this.getUsers();
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    let updatedUser: User;

    if (existingIndex >= 0) {
      updatedUser = {
        ...users[existingIndex],
        role,
        updatedAt: new Date().toISOString(),
      };
      users[existingIndex] = updatedUser;
    } else {
      updatedUser = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(updatedUser);
    }

    await writeJsonData(this.FILENAME, users);
    return updatedUser;
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const id = `usr_${Date.now()}`;
        const newUser = new MongoUser({
          ...userData,
          id,
        });
        const saved = await newUser.save();
        return {
          ...userData,
          id,
          createdAt: saved.createdAt ? new Date(saved.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: saved.updatedAt ? new Date(saved.updatedAt).toISOString() : new Date().toISOString(),
        };
      } catch (err) {
        console.warn('MongoDB failed in createUser. Falling back to JSON database:', err);
      }
    }

    const users = await this.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeJsonData(this.FILENAME, users);
    return newUser;
  }

  static async updateUserProfile(email: string, name: string, avatarUrl: string): Promise<User | null> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const updated = await MongoUser.findOneAndUpdate(
          { email: { $regex: new RegExp(`^${email}$`, 'i') } },
          { $set: { name, avatarUrl } },
          { new: true }
        ).lean();
        if (updated) {
          return {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role as UserRole,
            avatarUrl: updated.avatarUrl || '',
            createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('MongoDB failed in updateUserProfile. Falling back to JSON database:', err);
      }
    }

    const users = await this.getUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (index < 0) return null;

    users[index] = {
      ...users[index],
      name,
      avatarUrl,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonData(this.FILENAME, users);
    return users[index];
  }

  static async deleteUser(id: string): Promise<boolean> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const res = await MongoUser.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (err) {
        console.warn('MongoDB failed in deleteUser. Falling back to JSON database:', err);
      }
    }

    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length !== users.length) {
      await writeJsonData(this.FILENAME, filtered);
      return true;
    }
    return false;
  }
}

