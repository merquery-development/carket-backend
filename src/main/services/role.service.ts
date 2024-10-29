import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Role
  async createRole(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({
      data,
    });
  }

  // Get All Roles
  async getRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  // Get Role by ID
  async getRoleById(id: number): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  // Update Role
  async updateRole(id: number, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  // Delete Role
  async deleteRole(id: number): Promise<Role> {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}