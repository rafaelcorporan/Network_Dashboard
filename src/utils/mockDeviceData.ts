import { NetworkDevice, NetworkInterface, VlanInfo, ServiceInfo } from '@/store/slices/networkSlice'

// Generate comprehensive mock device data for Device Inventory
export const generateMockDeviceInventory = (): NetworkDevice[] => {
  const locations = [
    'Headquarters - Floor 1', 'Headquarters - Floor 2', 'Headquarters - Floor 3',
    'Data Center East', 'Data Center West', 'Branch Office NYC', 'Branch Office LA',
    'Remote Office Seattle', 'Remote Office Austin', 'Cloud Region US-East',
    'Cloud Region US-West', 'Manufacturing Plant A', 'Manufacturing Plant B'
  ]
  
  const dataCenters = [
    'Primary DC', 'Secondary DC', 'Edge DC', 'Cloud DC', 'Backup DC'
  ]
  
  const vendors = [
    'Cisco', 'Juniper', 'Arista', 'HP Enterprise', 'Dell Technologies', 
    'Fortinet', 'Palo Alto Networks', 'Ubiquiti', 'Meraki', 'Extreme Networks',
    'Alcatel-Lucent', 'Huawei', 'Brocade', 'F5 Networks', 'VMware'
  ]
  
  const osVersions = [
    'IOS 15.6', 'IOS-XE 16.12', 'NX-OS 9.3', 'JunOS 20.4', 'EOS 4.25',
    'Ubuntu 20.04', 'CentOS 8', 'Windows Server 2019', 'ESXi 7.0', 'Proxmox 6.4'
  ]

  const devices: NetworkDevice[] = []
  let deviceId = 1

  // Core Network Infrastructure
  const coreDevices = [
    { type: 'router' as const, count: 12, prefix: 'RTR', vendor: 'Cisco' },
    { type: 'switch' as const, count: 25, prefix: 'SW', vendor: 'Cisco' },
    { type: 'firewall' as const, count: 8, prefix: 'FW', vendor: 'Fortinet' },
    { type: 'load-balancer' as const, count: 6, prefix: 'LB', vendor: 'F5 Networks' },
    { type: 'ids-ips' as const, count: 4, prefix: 'IPS', vendor: 'Palo Alto Networks' }
  ]

  // Server Infrastructure
  const serverDevices = [
    { type: 'server' as const, count: 20, prefix: 'SRV', vendor: 'Dell Technologies' },
    { type: 'hypervisor' as const, count: 15, prefix: 'ESX', vendor: 'VMware' },
    { type: 'container-host' as const, count: 10, prefix: 'K8S', vendor: 'Dell Technologies' }
  ]

  // End-user Devices
  const endUserDevices = [
    { type: 'workstation' as const, count: 35, prefix: 'WS', vendor: 'HP Enterprise' },
    { type: 'access-point' as const, count: 18, prefix: 'AP', vendor: 'Ubiquiti' }
  ]

  const allDeviceGroups = [...coreDevices, ...serverDevices, ...endUserDevices]

  // Generate MAC addresses
  const generateMacAddress = () => {
    return Array.from({length: 6}, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join(':')
  }

  // Generate interfaces based on device type
  const generateInterfaces = (deviceType: string, count: number, deviceId: number): NetworkInterface[] => {
    const interfaces: NetworkInterface[] = []
    
    for (let j = 0; j < count; j++) {
      let interfaceName = ''
      let interfaceType = 'ethernet'
      let speed = '1Gbps'
      
      switch (deviceType) {
        case 'router':
          interfaceName = `GigabitEthernet0/${j}`
          speed = Math.random() > 0.5 ? '10Gbps' : '1Gbps'
          break
        case 'switch':
          interfaceName = `GigabitEthernet${Math.floor(j/24) + 1}/${(j % 24) + 1}`
          speed = Math.random() > 0.7 ? '10Gbps' : '1Gbps'
          break
        case 'server':
          interfaceName = `eth${j}`
          speed = Math.random() > 0.6 ? '10Gbps' : '1Gbps'
          break
        case 'access-point':
          interfaceName = j === 0 ? 'eth0' : `wlan${j-1}`
          interfaceType = j === 0 ? 'ethernet' : 'wireless'
          speed = interfaceType === 'wireless' ? '300Mbps' : '1Gbps'
          break
        case 'workstation':
          interfaceName = j === 0 ? 'eth0' : 'wlan0'
          interfaceType = j === 0 ? 'ethernet' : 'wireless'
          speed = interfaceType === 'wireless' ? '150Mbps' : '1Gbps'
          break
        default:
          interfaceName = `eth${j}`
          break
      }

      const interfaceStatus = Math.random() > 0.15 ? 'up' : 'down'
      
      interfaces.push({
        id: `${deviceId}-${j}`,
        name: interfaceName,
        type: interfaceType,
        status: interfaceStatus,
        speed,
        duplex: 'full',
        utilization: Math.floor(Math.random() * 80) + 5,
        errors: Math.floor(Math.random() * 100),
        packets: Math.floor(Math.random() * 10000000),
        bytes: Math.floor(Math.random() * 1000000000),
        macAddress: generateMacAddress(),
        vlanId: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : undefined
      })
    }
    
    return interfaces
  }

  // Generate VLANs
  const generateVlans = (): VlanInfo[] => {
    const vlanCount = Math.floor(Math.random() * 5) + 1
    const vlans: VlanInfo[] = []
    
    for (let v = 0; v < vlanCount; v++) {
      const vlanId = Math.floor(Math.random() * 100) + 10
      vlans.push({
        id: vlanId,
        name: `VLAN_${vlanId}`,
        description: `VLAN ${vlanId} - ${['Management', 'Production', 'Development', 'Guest', 'IoT'][v % 5]}`,
        interfaces: [`eth${v}`]
      })
    }
    
    return vlans
  }

  // Generate services based on device type
  const generateServices = (deviceType: string): ServiceInfo[] => {
    const commonServices = [
      { port: 22, protocol: 'tcp' as const, service: 'SSH', version: 'OpenSSH 8.2', status: 'open' as const },
      { port: 161, protocol: 'udp' as const, service: 'SNMP', version: 'v2c', status: 'open' as const }
    ]

    const typeSpecificServices: Record<string, Omit<ServiceInfo, 'status'>[]> = {
      'router': [
        { port: 23, protocol: 'tcp', service: 'Telnet' },
        { port: 179, protocol: 'tcp', service: 'BGP' },
        { port: 520, protocol: 'udp', service: 'RIP' }
      ],
      'switch': [
        { port: 23, protocol: 'tcp', service: 'Telnet' },
        { port: 443, protocol: 'tcp', service: 'HTTPS' }
      ],
      'firewall': [
        { port: 443, protocol: 'tcp', service: 'HTTPS' },
        { port: 4433, protocol: 'tcp', service: 'Management' }
      ],
      'server': [
        { port: 80, protocol: 'tcp', service: 'HTTP' },
        { port: 443, protocol: 'tcp', service: 'HTTPS' },
        { port: 3389, protocol: 'tcp', service: 'RDP' },
        { port: 5432, protocol: 'tcp', service: 'PostgreSQL' }
      ],
      'workstation': [
        { port: 3389, protocol: 'tcp', service: 'RDP' }
      ]
    }

    const services = [...commonServices]
    const typeServices = typeSpecificServices[deviceType] || []
    
    typeServices.forEach(service => {
      const randomValue = Math.random()
      const status = randomValue > 0.85 ? 'filtered' : randomValue > 0.1 ? 'open' : 'closed'
      services.push({
        ...service,
        status: status as 'open' | 'closed' | 'filtered'
      })
    })

    return services
  }

  allDeviceGroups.forEach(({ type, count, prefix, vendor }) => {
    for (let i = 1; i <= count; i++) {
      const hostname = `${prefix}-${i.toString().padStart(3, '0')}`
      const location = locations[Math.floor(Math.random() * locations.length)]
      const dataCenter = dataCenters[Math.floor(Math.random() * dataCenters.length)]
      
      // Realistic status distribution
      const statusRand = Math.random()
      const status = statusRand > 0.92 ? 'offline' : 
                    statusRand > 0.82 ? 'warning' : 
                    statusRand > 0.02 ? 'online' : 'unknown'

      // Generate realistic IP addresses
      const subnet = Math.floor(Math.random() * 20) + 10 // 10-29
      const host = Math.floor(Math.random() * 200) + 10  // 10-209
      const ipv4 = `192.168.${subnet}.${host}`
      const ipv6 = `2001:db8:${subnet.toString(16)}::${host.toString(16)}`

      const interfaceCount = 
        type === 'router' ? Math.floor(Math.random() * 8) + 4 :
        type === 'switch' ? Math.floor(Math.random() * 20) + 12 :
        type === 'server' ? Math.floor(Math.random() * 4) + 2 :
        type === 'workstation' ? 2 :
        type === 'access-point' ? Math.floor(Math.random() * 3) + 2 :
        Math.floor(Math.random() * 6) + 2

      const device: NetworkDevice = {
        id: `device-${deviceId}`,
        hostname,
        label: hostname,
        ipAddresses: [ipv4, ipv6],
        macAddresses: [generateMacAddress()],
        type,
        status,
        vendor,
        model: `${vendor}-${Math.floor(Math.random() * 9000) + 1000}${type.charAt(0).toUpperCase()}`,
        osVersion: osVersions[Math.floor(Math.random() * osVersions.length)],
        firmwareVersion: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 100)}`,
        location,
        dataCenter,
        uptime: Math.floor(Math.random() * 8760), // hours in a year
        cpu: Math.floor(Math.random() * 90) + 5,
        memory: Math.floor(Math.random() * 85) + 10,
        temperature: Math.floor(Math.random() * 35) + 25, // 25-60°C
        interfaces: generateInterfaces(type, interfaceCount, deviceId),
        vlans: type === 'switch' || type === 'router' ? generateVlans() : [],
        routingTable: type === 'router' ? [
          {
            destination: '0.0.0.0/0',
            nextHop: '192.168.1.1',
            interface: 'GigabitEthernet0/0',
            metric: 1,
            protocol: 'static'
          },
          {
            destination: '192.168.0.0/16',
            nextHop: '0.0.0.0',
            interface: 'GigabitEthernet0/1',
            metric: 0,
            protocol: 'connected'
          }
        ] : [],
        openPorts: [22, 80, 443, 161, 162].filter(() => Math.random() > 0.3),
        services: generateServices(type),
        snmpInfo: Math.random() > 0.3 ? {
          version: '2c',
          community: 'public',
          sysDescr: `${vendor} ${type} running ${osVersions[Math.floor(Math.random() * osVersions.length)]}`,
          sysObjectId: `1.3.6.1.4.1.${Math.floor(Math.random() * 10000)}`,
          sysUpTime: Math.floor(Math.random() * 100000000),
          sysContact: 'admin@company.com',
          sysName: hostname,
          sysLocation: location
        } : null,
        credentials: Math.random() > 0.2 ? {
          ssh: {
            username: 'admin'
          },
          snmp: {
            version: '2c',
            community: 'public'
          }
        } : null,
        lastDiscovered: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        discoveryMethods: ['ping', 'snmp', 'ssh'].filter(() => Math.random() > 0.3),
        position: {
          x: Math.random() * 1000,
          y: Math.random() * 800
        }
      }

      devices.push(device)
      deviceId++
    }
  })

  return devices
} 