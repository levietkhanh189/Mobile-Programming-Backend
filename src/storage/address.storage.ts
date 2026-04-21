import prisma from '../config/database';
import { CreateAddressDto } from '../types/address.types';

class AddressStorage {
  async findByUser(userId: number) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(userId: number, data: CreateAddressDto) {
    const count = await prisma.address.count({ where: { userId } });
    return prisma.address.create({
      data: {
        userId,
        label: data.label || 'Nhà',
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        isDefault: count === 0,
      },
    });
  }

  async update(id: number, userId: number, data: Partial<CreateAddressDto>) {
    return prisma.address.update({ where: { id, userId }, data });
  }

  async delete(id: number, userId: number) {
    return prisma.address.delete({ where: { id, userId } });
  }

  async setDefault(id: number, userId: number) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return prisma.address.update({ where: { id, userId }, data: { isDefault: true } });
  }

  async findById(id: number, userId: number) {
    return prisma.address.findUnique({ where: { id, userId } });
  }
}

export const addressStorage = new AddressStorage();
