import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma, Role } from '@prisma/client';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto } from '../utils/dto/role.dto';

@ApiTags('roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Create Role
  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto})
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createRole(@Body() data: CreateRoleDto) {
    try {
      return await this.roleService.createRole(data);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Get All Roles
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async getRoles(): Promise<Role[]> {
    return this.roleService.getRoles();
  }

  // Get Role by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role data' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRoleById(@Param('id') id: string): Promise<Role> {
    const roleId = parseInt(id);
    return this.roleService.getRoleById(roleId);
  }

  // Update Role
  @Put(':id')
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto})
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async updateRole(
    @Param('id') id: string,
    @Body() data: UpdateRoleDto,
  ) {
    try {
      const roleId = parseInt(id);
      return await this.roleService.updateRole(roleId, data);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Delete Role
  @Delete(':id')
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async deleteRole(@Param('id') id: string) {
    try {
      const roleId = parseInt(id);
      return await this.roleService.deleteRole(roleId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
