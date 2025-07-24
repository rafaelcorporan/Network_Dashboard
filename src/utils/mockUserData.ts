import { UserProfile, UserRole, UserStatus, MembershipType, AuditLog } from '@/store/slices/userManagementSlice'

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jennifer', 'James', 'Mary', 'Christopher', 'Patricia', 'Daniel', 'Linda', 'Matthew', 'Elizabeth', 'Anthony', 'Barbara']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
const companies = ['TechCorp', 'DataSolutions', 'CloudSystems', 'NetworkPro', 'SecureIT', 'MonitorMax', 'InfraTech', 'SystemGuard', 'NetWatch', 'CyberShield']
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA']

const generateRandomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

const generateRandomUser = (id: string, role: UserRole): UserProfile => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companies[Math.floor(Math.random() * companies.length)].toLowerCase()}.com`
  
  const statuses: UserStatus[] = ['active', 'disabled', 'suspended']
  const membershipTypes: MembershipType[] = ['basic', 'premium', 'enterprise']
  
  // Weight status distribution (most users should be active)
  const statusWeights = [0.8, 0.15, 0.05] // 80% active, 15% disabled, 5% suspended
  const statusRandom = Math.random()
  let status: UserStatus = 'active'
  if (statusRandom > statusWeights[0]) {
    status = statusRandom > statusWeights[0] + statusWeights[1] ? 'suspended' : 'disabled'
  }

  const cityIndex = Math.floor(Math.random() * cities.length)
  
  const registrationDate = generateRandomDate(new Date(2020, 0, 1), new Date())
  const lastLogin = Math.random() > 0.3 ? generateRandomDate(new Date(registrationDate), new Date()) : undefined
  const lastActivity = lastLogin ? generateRandomDate(new Date(lastLogin), new Date()) : undefined

  const permissions = generatePermissions(role)
  
  return {
    id,
    email,
    firstName,
    lastName,
    phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    address: {
      street: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Maple'][Math.floor(Math.random() * 5)]} St`,
      city: cities[cityIndex],
      state: states[cityIndex],
      country: 'USA',
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
    },
    role,
    status,
    membershipType: membershipTypes[Math.floor(Math.random() * membershipTypes.length)],
    organizationId: role !== 'developer' ? `org-${Math.floor(Math.random() * 10) + 1}` : undefined,
    teamIds: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => `team-${i + 1}`),
    permissions,
    registrationDate,
    lastLogin,
    lastActivity,
    usageMetrics: {
      dataConsumption: Math.floor(Math.random() * 1000) + 100, // GB
      monitoredEntities: Math.floor(Math.random() * 500) + 10,
      uptimePercentage: 95 + Math.random() * 5, // 95-100%
      apiCalls: Math.floor(Math.random() * 100000) + 1000
    },
    communicationPreferences: {
      emailNotifications: Math.random() > 0.2,
      smsNotifications: Math.random() > 0.7,
      marketingEmails: Math.random() > 0.5,
      securityAlerts: Math.random() > 0.1
    },
    billingInfo: role !== 'developer' ? {
      subscriptionStatus: ['active', 'past_due', 'canceled', 'trial'][Math.floor(Math.random() * 4)] as any,
      nextBillingDate: generateRandomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
      subscriptionPlan: `${membershipTypes[Math.floor(Math.random() * membershipTypes.length)]}-monthly`
    } : undefined,
    apiKeys: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => `api-key-${id}-${i}`),
    sessionInfo: {
      currentSessions: Math.floor(Math.random() * 3) + 1,
      lastIpAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      deviceInfo: ['Chrome/Windows', 'Safari/macOS', 'Firefox/Linux', 'Edge/Windows'][Math.floor(Math.random() * 4)]
    }
  }
}

const generatePermissions = (role: UserRole): string[] => {
  const basePermissions = ['read_dashboard', 'read_alerts']
  
  switch (role) {
    case 'client':
      return [...basePermissions, 'read_own_data', 'update_own_profile', 'read_reports']
    case 'manager':
      return [...basePermissions, 'read_team_data', 'manage_team_users', 'read_analytics', 'export_reports']
    case 'localAdmin':
      return [...basePermissions, 'manage_organization_users', 'read_organization_data', 'configure_organization', 'manage_billing']
    case 'developer':
      return ['*'] // All permissions
    default:
      return basePermissions
  }
}

export const generateMockUsers = (count: number = 100): UserProfile[] => {
  const users: UserProfile[] = []
  const roleDistribution = {
    client: 0.6,      // 60%
    manager: 0.25,    // 25%
    localAdmin: 0.13, // 13%
    developer: 0.02   // 2%
  }

  let clientCount = Math.floor(count * roleDistribution.client)
  let managerCount = Math.floor(count * roleDistribution.manager)
  let localAdminCount = Math.floor(count * roleDistribution.localAdmin)
  let developerCount = count - clientCount - managerCount - localAdminCount

  // Generate clients
  for (let i = 0; i < clientCount; i++) {
    users.push(generateRandomUser(`client-${i + 1}`, 'client'))
  }

  // Generate managers
  for (let i = 0; i < managerCount; i++) {
    users.push(generateRandomUser(`manager-${i + 1}`, 'manager'))
  }

  // Generate local admins
  for (let i = 0; i < localAdminCount; i++) {
    users.push(generateRandomUser(`localadmin-${i + 1}`, 'localAdmin'))
  }

  // Generate developers
  for (let i = 0; i < developerCount; i++) {
    users.push(generateRandomUser(`developer-${i + 1}`, 'developer'))
  }

  return users
}

export const generateMockAuditLogs = (users: UserProfile[], count: number = 50): AuditLog[] => {
  const actions = [
    'user_created',
    'user_updated',
    'user_deleted',
    'status_changed',
    'membership_updated',
    'permissions_modified',
    'password_reset',
    'login_attempt',
    'profile_viewed',
    'billing_updated'
  ]

  const adminUsers = users.filter(u => ['developer', 'localAdmin'].includes(u.role))
  
  return Array.from({ length: count }, (_, i) => {
    const targetUser = users[Math.floor(Math.random() * users.length)]
    const adminUser = adminUsers[Math.floor(Math.random() * adminUsers.length)]
    const action = actions[Math.floor(Math.random() * actions.length)]
    
    return {
      id: `audit-${i + 1}`,
      userId: targetUser.id,
      adminId: adminUser.id,
      adminName: `${adminUser.firstName} ${adminUser.lastName}`,
      action,
      details: {
        action,
        targetUser: `${targetUser.firstName} ${targetUser.lastName}`,
        changes: generateActionDetails(action)
      },
      timestamp: generateRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const generateActionDetails = (action: string): Record<string, any> => {
  switch (action) {
    case 'status_changed':
      return {
        from: 'active',
        to: 'suspended',
        reason: 'Policy violation'
      }
    case 'membership_updated':
      return {
        from: 'basic',
        to: 'premium',
        effectiveDate: new Date().toISOString()
      }
    case 'permissions_modified':
      return {
        added: ['read_analytics'],
        removed: ['manage_billing']
      }
    default:
      return {}
  }
}

export const generateMockUserManagementData = () => {
  const users = generateMockUsers(100)
  const auditLogs = generateMockAuditLogs(users, 50)
  
  return {
    users,
    auditLogs
  }
} 