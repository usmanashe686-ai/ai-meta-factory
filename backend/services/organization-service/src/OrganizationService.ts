import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Role = 'owner' | 'admin' | 'member';

export interface OrganizationData {
  name: string;
  slug: string;
  settings?: Record<string, any>;
}

export interface TeamData {
  name: string;
  description?: string;
}

export class OrganizationService {
  // ========== Organization CRUD ==========
  async createOrganization(ownerId: string, data: OrganizationData) {
    // Check if slug is unique
    const existing = await prisma.organization.findUnique({
      where: { slug: data.slug }
    });
    if (existing) throw new Error('Organization slug already exists');

    // Create organization and owner membership in a transaction
    const org = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          settings: data.settings || {},
        }
      });
      // Add owner as member with role 'owner'
      await tx.membership.create({
        data: {
          userId: ownerId,
          organizationId: org.id,
          role: 'owner',
        }
      });
      return org;
    });
    return org;
  }

  async getOrganization(orgId: string) {
    return prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        teams: true,
      }
    });
  }

  async updateOrganization(orgId: string, data: Partial<OrganizationData>) {
    return prisma.organization.update({
      where: { id: orgId },
      data,
    });
  }

  async deleteOrganization(orgId: string) {
    // This will cascade delete memberships, teams, etc. (if relations set up)
    return prisma.organization.delete({ where: { id: orgId } });
  }

  // ========== Membership Management ==========
  async addMember(orgId: string, userId: string, role: Role = 'member') {
    // Check if user already a member
    const existing = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: orgId }
      }
    });
    if (existing) throw new Error('User is already a member of this organization');

    return prisma.membership.create({
      data: {
        userId,
        organizationId: orgId,
        role,
      }
    });
  }

  async removeMember(orgId: string, userId: string) {
    // Prevent removing the last owner? You might want to check.
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } }
    });
    if (!membership) throw new Error('Membership not found');
    if (membership.role === 'owner') {
      // Count owners
      const ownerCount = await prisma.membership.count({
        where: { organizationId: orgId, role: 'owner' }
      });
      if (ownerCount <= 1) throw new Error('Cannot remove the last owner');
    }
    return prisma.membership.delete({
      where: { userId_organizationId: { userId, organizationId: orgId } }
    });
  }

  async updateMemberRole(orgId: string, userId: string, newRole: Role) {
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } }
    });
    if (!membership) throw new Error('Membership not found');
    // Prevent demoting last owner
    if (membership.role === 'owner' && newRole !== 'owner') {
      const ownerCount = await prisma.membership.count({
        where: { organizationId: orgId, role: 'owner' }
      });
      if (ownerCount <= 1) throw new Error('Cannot demote the last owner');
    }
    return prisma.membership.update({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      data: { role: newRole }
    });
  }

  async getMembers(orgId: string) {
    return prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } }
    });
  }

  // ========== Teams ==========
  async createTeam(orgId: string, data: TeamData) {
    return prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        organizationId: orgId,
      }
    });
  }

  async getTeams(orgId: string) {
    return prisma.team.findMany({
      where: { organizationId: orgId },
      include: { members: { include: { user: { select: { id: true, name: true } } } } }
    });
  }

  async deleteTeam(teamId: string) {
    return prisma.team.delete({ where: { id: teamId } });
  }

  // ========== Team Membership ==========
  async addTeamMember(teamId: string, userId: string) {
    // Optionally check that user is member of the organization first
    return prisma.teamMembership.create({
      data: { teamId, userId }
    });
  }

  async removeTeamMember(teamId: string, userId: string) {
    return prisma.teamMembership.delete({
      where: { userId_teamId: { userId, teamId } }
    });
  }

  // ========== Invitations ==========
  async inviteUser(orgId: string, email: string, role: Role = 'member') {
    // Create invitation record (expires in 7 days)
    return prisma.invitation.create({
      data: {
        email,
        organizationId: orgId,
        role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true }
    });
    if (!invitation) throw new Error('Invitation not found');
    if (invitation.expiresAt < new Date()) throw new Error('Invitation expired');
    if (invitation.acceptedAt) throw new Error('Invitation already accepted');

    // Add user as member
    await prisma.membership.create({
      data: {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      }
    });
    // Mark invitation as accepted
    return prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() }
    });
  }

  // ========== Authorization helpers ==========
  async getUserRoleInOrg(userId: string, orgId: string): Promise<Role | null> {
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } }
    });
    return membership?.role || null;
  }

  async hasPermission(userId: string, orgId: string, requiredRole: Role): Promise<boolean> {
    const role = await this.getUserRoleInOrg(userId, orgId);
    if (!role) return false;
    const roleHierarchy = ['member', 'admin', 'owner'];
    return roleHierarchy.indexOf(role) >= roleHierarchy.indexOf(requiredRole);
  }
}
