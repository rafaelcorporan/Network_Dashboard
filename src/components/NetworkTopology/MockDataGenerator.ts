import { 
  NetworkTopology, 
  NetworkDevice, 
  NetworkConnection, 
  NetworkInterface,
  VlanInfo,
  DiscoveryStats 
} from '@/store/slices/networkSlice'

export const generateMockNetworkData = (): NetworkTopology => {
  const devices: NetworkDevice[] = []
  const connections: NetworkConnection[] = []
  
  // Generate core infrastructure devices
  const coreRouter = createMockDevice({
    id: 'core-router-01',
    hostname: 'core-rtr-dc1',
    type: 'router',
    vendor: 'Cisco',
    model: 'ISR4431',
    location: 'Data Center 1',
    dataCenter: 'DC1',
    ipAddresses: ['10.0.1.1'],
    interfaceCount: 8
  })
  devices.push(coreRouter)
  
  // Distribution switches
  for (let i = 1; i <= 3; i++) {
    const distSwitch = createMockDevice({
      id: `dist-switch-${i.toString().padStart(2, '0')}`,
      hostname: `dist-sw-${i}`,
      type: 'switch',
      vendor: 'Cisco',
      model: 'Catalyst 9300',
      location: `Floor ${i}`,
      dataCenter: 'DC1',
      ipAddresses: [`10.0.${i + 1}.1`],
      interfaceCount: 24
    })
    devices.push(distSwitch)
    
    // Connect to core router
    connections.push(createMockConnection(
      coreRouter.id,
      distSwitch.id,
      'GigabitEthernet0/0/1',
      'GigabitEthernet1/0/1',
      'ethernet'
    ))
  }
  
  // Access switches
  for (let floor = 1; floor <= 3; floor++) {
    for (let sw = 1; sw <= 4; sw++) {
      const accessSwitch = createMockDevice({
        id: `access-switch-${floor}-${sw}`,
        hostname: `access-sw-${floor}-${sw}`,
        type: 'switch',
        vendor: 'Cisco',
        model: 'Catalyst 2960',
        location: `Floor ${floor}`,
        dataCenter: 'DC1',
        ipAddresses: [`10.${floor}.${sw}.1`],
        interfaceCount: 48
      })
      devices.push(accessSwitch)
      
      // Connect to distribution switch
      const distSwitchId = `dist-switch-${floor.toString().padStart(2, '0')}`
      connections.push(createMockConnection(
        distSwitchId,
        accessSwitch.id,
        `GigabitEthernet1/0/${sw + 1}`,
        'GigabitEthernet0/1',
        'ethernet'
      ))
    }
  }
  
  // Firewalls
  const firewall = createMockDevice({
    id: 'firewall-01',
    hostname: 'fw-perimeter',
    type: 'firewall',
    vendor: 'Fortinet',
    model: 'FortiGate 600E',
    location: 'DMZ',
    dataCenter: 'DC1',
    ipAddresses: ['10.0.0.1', '192.168.1.1'],
    interfaceCount: 6
  })
  devices.push(firewall)
  
  connections.push(createMockConnection(
    coreRouter.id,
    firewall.id,
    'GigabitEthernet0/0/0',
    'port1',
    'ethernet'
  ))
  
  // Servers
  const serverTypes = ['web', 'database', 'application', 'file', 'backup']
  for (let i = 0; i < 15; i++) {
    const serverType = serverTypes[i % serverTypes.length]
    const server = createMockDevice({
      id: `server-${serverType}-${Math.floor(i / serverTypes.length) + 1}`,
      hostname: `${serverType}-srv-${Math.floor(i / serverTypes.length) + 1}`,
      type: 'server',
      vendor: 'Dell',
      model: 'PowerEdge R740',
      location: 'Server Room',
      dataCenter: 'DC1',
      ipAddresses: [`10.10.${Math.floor(i / 10) + 1}.${(i % 10) + 10}`],
      interfaceCount: 4,
      cpu: Math.floor(Math.random() * 80) + 10,
      memory: Math.floor(Math.random() * 70) + 20
    })
    devices.push(server)
    
    // Connect to random access switch
    const accessSwitchIndex = Math.floor(Math.random() * 12) // 3 floors * 4 switches
    const floor = Math.floor(accessSwitchIndex / 4) + 1
    const sw = (accessSwitchIndex % 4) + 1
    const accessSwitchId = `access-switch-${floor}-${sw}`
    
    connections.push(createMockConnection(
      accessSwitchId,
      server.id,
      `FastEthernet0/${Math.floor(Math.random() * 48) + 1}`,
      'eth0',
      'ethernet'
    ))
  }
  
  // Wireless Access Points
  for (let floor = 1; floor <= 3; floor++) {
    for (let ap = 1; ap <= 6; ap++) {
      const accessPoint = createMockDevice({
        id: `ap-${floor}-${ap}`,
        hostname: `ap-floor${floor}-${ap}`,
        type: 'access-point',
        vendor: 'Cisco',
        model: 'Aironet 9120',
        location: `Floor ${floor}`,
        dataCenter: 'DC1',
        ipAddresses: [`10.${floor}.100.${ap}`],
        interfaceCount: 2
      })
      devices.push(accessPoint)
      
      // Connect to access switch
      const sw = Math.ceil(ap / 2)
      const accessSwitchId = `access-switch-${floor}-${sw}`
      connections.push(createMockConnection(
        accessSwitchId,
        accessPoint.id,
        `FastEthernet0/${20 + ap}`,
        'GigabitEthernet0',
        'ethernet'
      ))
    }
  }
  
  // Workstations
  for (let floor = 1; floor <= 3; floor++) {
    for (let ws = 1; ws <= 20; ws++) {
      const workstation = createMockDevice({
        id: `ws-${floor}-${ws}`,
        hostname: `ws-${floor}-${ws.toString().padStart(3, '0')}`,
        type: 'workstation',
        vendor: 'Dell',
        model: 'OptiPlex 7090',
        location: `Floor ${floor}`,
        dataCenter: 'DC1',
        ipAddresses: [`10.${floor}.200.${ws}`],
        interfaceCount: 1,
        cpu: Math.floor(Math.random() * 60) + 10,
        memory: Math.floor(Math.random() * 50) + 30
      })
      devices.push(workstation)
      
      // Connect to access switch
      const sw = Math.ceil(ws / 5)
      const accessSwitchId = `access-switch-${floor}-${sw}`
      connections.push(createMockConnection(
        accessSwitchId,
        workstation.id,
        `FastEthernet0/${ws}`,
        'eth0',
        'ethernet'
      ))
    }
  }
  
  // Generate discovery stats
  const discoveryStats = generateDiscoveryStats(devices, connections)
  
  return {
    devices,
    connections,
    subnets: generateMockSubnets(),
    lastUpdated: new Date().toISOString(),
    discoveryStats
  }
}

interface MockDeviceOptions {
  id: string
  hostname: string
  type: NetworkDevice['type']
  vendor: string
  model: string
  location: string
  dataCenter: string
  ipAddresses: string[]
  interfaceCount: number
  cpu?: number
  memory?: number
}

const createMockDevice = (options: MockDeviceOptions): NetworkDevice => {
  const {
    id,
    hostname,
    type,
    vendor,
    model,
    location,
    dataCenter,
    ipAddresses,
    interfaceCount,
    cpu = Math.floor(Math.random() * 50) + 20,
    memory = Math.floor(Math.random() * 60) + 30
  } = options
  
  const status = Math.random() > 0.1 ? (Math.random() > 0.8 ? 'warning' : 'online') : 'offline'
  
  return {
    id,
    hostname,
    label: hostname,
    ipAddresses,
    macAddresses: [generateMacAddress()],
    type,
    status,
    vendor,
    model,
    osVersion: generateOsVersion(vendor),
    firmwareVersion: generateFirmwareVersion(),
    location,
    dataCenter,
    uptime: Math.floor(Math.random() * 8640000), // Up to 100 days in seconds
    cpu,
    memory,
    temperature: Math.floor(Math.random() * 40) + 30, // 30-70°C
    interfaces: generateMockInterfaces(interfaceCount, type),
    vlans: generateMockVlans(type),
    routingTable: type === 'router' ? generateMockRoutes() : [],
    openPorts: generateOpenPorts(type),
    services: generateServices(type),
    snmpInfo: {
      version: '2c',
      community: 'public',
      sysDescr: `${vendor} ${model}`,
      sysName: hostname,
      sysLocation: location,
      sysContact: 'admin@company.com',
      sysUpTime: Math.floor(Math.random() * 8640000)
    },
    credentials: null,
    lastDiscovered: new Date().toISOString(),
    discoveryMethods: ['ping', 'snmp']
  }
}

const createMockConnection = (
  sourceId: string,
  targetId: string,
  sourceInterface: string,
  targetInterface: string,
  type: NetworkConnection['type']
): NetworkConnection => {
  const utilization = Math.floor(Math.random() * 100)
  const status = Math.random() > 0.05 ? 'active' : (Math.random() > 0.5 ? 'degraded' : 'error')
  
  return {
    id: `conn-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    sourceInterface,
    targetInterface,
    type,
    bandwidth: type === 'ethernet' ? '1000' : '100',
    utilization,
    latency: Math.random() * 10 + 1,
    packetLoss: Math.random() * 0.1,
    status,
    discoveryMethod: 'cdp',
    lastSeen: new Date().toISOString()
  }
}

const generateMockInterfaces = (count: number, deviceType: string): NetworkInterface[] => {
  const interfaces: NetworkInterface[] = []
  
  for (let i = 0; i < count; i++) {
    const interfaceType = deviceType === 'router' ? 'GigabitEthernet' : 
                         deviceType === 'server' || deviceType === 'workstation' ? 'eth' :
                         'FastEthernet'
    
    const name = deviceType === 'server' || deviceType === 'workstation' ? 
                 `eth${i}` : 
                 `${interfaceType}${Math.floor(i / 24)}/${i % 24}`
    
    interfaces.push({
      id: `int-${i}`,
      name,
      type: 'ethernet',
      status: Math.random() > 0.1 ? 'up' : 'down',
      speed: deviceType === 'router' ? '1000' : '100',
      duplex: 'full',
      utilization: Math.floor(Math.random() * 100),
      errors: Math.floor(Math.random() * 10),
      packets: Math.floor(Math.random() * 1000000),
      bytes: Math.floor(Math.random() * 1000000000),
      vlanId: Math.floor(Math.random() * 100) + 1
    })
  }
  
  return interfaces
}

const generateMockVlans = (deviceType: string): VlanInfo[] => {
  if (deviceType !== 'switch' && deviceType !== 'router') return []
  
  const vlans: VlanInfo[] = []
  const vlanCount = Math.floor(Math.random() * 5) + 2
  
  for (let i = 0; i < vlanCount; i++) {
    const vlanId = (i + 1) * 10
    vlans.push({
      id: vlanId,
      name: `VLAN${vlanId}`,
      description: `Production VLAN ${vlanId}`,
      interfaces: [`GigabitEthernet0/${i}`, `GigabitEthernet0/${i + 1}`]
    })
  }
  
  return vlans
}

const generateMockRoutes = () => {
  return [
    {
      destination: '0.0.0.0/0',
      nextHop: '192.168.1.1',
      interface: 'GigabitEthernet0/0/0',
      metric: 1,
      protocol: 'static'
    },
    {
      destination: '10.0.0.0/8',
      nextHop: '10.0.1.1',
      interface: 'GigabitEthernet0/0/1',
      metric: 110,
      protocol: 'ospf'
    }
  ]
}

const generateOpenPorts = (deviceType: string): number[] => {
  const commonPorts = [22, 161] // SSH, SNMP
  
  switch (deviceType) {
    case 'server':
      return [...commonPorts, 80, 443, 3389, 3306, 5432]
    case 'firewall':
      return [...commonPorts, 443, 8080]
    case 'workstation':
      return [22, 3389]
    default:
      return commonPorts
  }
}

const generateServices = (deviceType: string) => {
  const services = []
  const openPorts = generateOpenPorts(deviceType)
  
  for (const port of openPorts) {
    const serviceMap: Record<number, string> = {
      22: 'ssh',
      80: 'http',
      443: 'https',
      161: 'snmp',
      3389: 'rdp',
      3306: 'mysql',
      5432: 'postgresql',
      8080: 'http-alt'
    }
    
    services.push({
      port,
      protocol: 'tcp' as const,
      service: serviceMap[port] || 'unknown',
      status: 'open' as const
    })
  }
  
  return services
}

const generateMacAddress = (): string => {
  const hex = '0123456789ABCDEF'
  let mac = ''
  
  for (let i = 0; i < 6; i++) {
    if (i > 0) mac += ':'
    mac += hex[Math.floor(Math.random() * 16)]
    mac += hex[Math.floor(Math.random() * 16)]
  }
  
  return mac
}

const generateOsVersion = (vendor: string): string => {
  switch (vendor.toLowerCase()) {
    case 'cisco':
      return `IOS ${Math.floor(Math.random() * 5) + 15}.${Math.floor(Math.random() * 10)}`
    case 'fortinet':
      return `FortiOS ${Math.floor(Math.random() * 3) + 6}.${Math.floor(Math.random() * 10)}`
    case 'dell':
      return `Ubuntu ${Math.floor(Math.random() * 4) + 18}.04`
    default:
      return `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`
  }
}

const generateFirmwareVersion = (): string => {
  return `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`
}

const generateMockSubnets = () => {
  return [
    {
      id: 'subnet-1',
      network: '10.0.0.0',
      mask: '255.255.0.0',
      gateway: '10.0.0.1',
      vlanId: 1,
      description: 'Management Network',
      deviceCount: 25,
      utilization: 45
    },
    {
      id: 'subnet-2',
      network: '10.1.0.0',
      mask: '255.255.255.0',
      gateway: '10.1.0.1',
      vlanId: 10,
      description: 'User Network Floor 1',
      deviceCount: 50,
      utilization: 78
    },
    {
      id: 'subnet-3',
      network: '10.2.0.0',
      mask: '255.255.255.0',
      gateway: '10.2.0.1',
      vlanId: 20,
      description: 'User Network Floor 2',
      deviceCount: 48,
      utilization: 72
    }
  ]
}

const generateDiscoveryStats = (devices: NetworkDevice[], connections: NetworkConnection[]): DiscoveryStats => {
  const devicesByType: Record<string, number> = {}
  const devicesByStatus: Record<string, number> = {}
  const devicesByLocation: Record<string, number> = {}
  const discoveryMethods: Record<string, number> = {}
  
  devices.forEach(device => {
    devicesByType[device.type] = (devicesByType[device.type] || 0) + 1
    devicesByStatus[device.status] = (devicesByStatus[device.status] || 0) + 1
    devicesByLocation[device.location] = (devicesByLocation[device.location] || 0) + 1
    
    device.discoveryMethods.forEach(method => {
      discoveryMethods[method] = (discoveryMethods[method] || 0) + 1
    })
  })
  
  return {
    totalDevices: devices.length,
    devicesByType,
    devicesByStatus,
    devicesByLocation,
    totalConnections: connections.length,
    discoveryMethods,
    lastScanDuration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
    coverage: Math.min(100, (devices.length / 1000) * 100)
  }
} 