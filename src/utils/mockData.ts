import { NetworkDevice, NetworkConnection, NetworkTopology, NetworkInterface, VlanInfo, ServiceInfo } from '@/store/slices/networkSlice'
import { Alert } from '@/store/slices/alertsSlice'
import { MonitoringData, MetricData } from '@/store/slices/monitoringSlice'

// Generate time series data
const generateTimeSeriesData = (points: number, baseValue: number, variance: number): MetricData[] => {
  const data: MetricData[] = []
  const now = new Date()
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000) // 1 minute intervals
    const value = baseValue + (Math.random() - 0.5) * variance
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.max(0, value),
      unit: ''
    })
  }
  
  return data
}

// Generate mock network nodes
const generateMockNodes = (): NetworkDevice[] => {
  const locations = ['Data Center 1', 'Data Center 2', 'Branch Office', 'Remote Site', 'Cloud Region']
  const vendors = ['Cisco', 'Juniper', 'Arista', 'HP', 'Dell', 'Fortinet', 'Palo Alto', 'Ubiquiti']
  const types: NetworkDevice['type'][] = ['router', 'switch', 'firewall', 'server', 'workstation', 'access-point']
  const statuses: NetworkDevice['status'][] = ['online', 'warning', 'offline']
  
  const nodes: NetworkDevice[] = []
  
  // Generate core infrastructure devices
  const coreDevices = [
    { type: 'router', count: 8, prefix: 'RTR' },
    { type: 'switch', count: 15, prefix: 'SW' },
    { type: 'firewall', count: 6, prefix: 'FW' },
    { type: 'server', count: 12, prefix: 'SRV' },
    { type: 'workstation', count: 8, prefix: 'WS' },
    { type: 'access-point', count: 10, prefix: 'AP' }
  ]

  let nodeId = 1
  
  coreDevices.forEach(({ type, count, prefix }) => {
    for (let i = 1; i <= count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const vendor = vendors[Math.floor(Math.random() * vendors.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]
      
      // Adjust status probabilities for more realistic distribution
      const statusProbability = Math.random()
      const finalStatus = statusProbability > 0.85 ? 'offline' : 
                         statusProbability > 0.75 ? 'warning' : 'online'
      
              nodes.push({
        id: `node-${nodeId}`,
        hostname: `${prefix}-${i.toString().padStart(2, '0')}`,
        label: `${prefix}-${i.toString().padStart(2, '0')}`,
        type: type as NetworkDevice['type'],
        status: finalStatus,
        ip: `192.168.${Math.floor(nodeId / 254)}.${(nodeId % 254) + 1}`,
        location,
        vendor,
        model: `${vendor}-${Math.floor(Math.random() * 9000) + 1000}${type.charAt(0).toUpperCase()}`,
        uptime: Math.floor(Math.random() * 8760), // hours
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        temperature: Math.floor(Math.random() * 40) + 30,
        interfaces: Array.from({ length: Math.floor(Math.random() * 12) + 2 }, (_, j) => ({
          id: `${nodeId}-${j}`,
          name: type === 'server' ? `eth${j}` : 
                type === 'access-point' ? `wlan${j}` :
                type === 'switch' ? `GigabitEthernet0/${j + 1}` :
                `FastEthernet0/${j}`,
          type: type === 'access-point' ? 'wireless' : 'ethernet',
          status: Math.random() > 0.15 ? 'up' : 'down',
          speed: type === 'server' || type === 'switch' ? 
                 ['1Gbps', '10Gbps'][Math.floor(Math.random() * 2)] :
                 ['100Mbps', '1Gbps'][Math.floor(Math.random() * 2)],
          utilization: Math.floor(Math.random() * 100),
          errors: Math.floor(Math.random() * 50),
          packets: Math.floor(Math.random() * 10000000)
        }))
      })
      nodeId++
    }
  })
  
  return nodes
}

// Generate mock network edges
const generateMockEdges = (nodes: NetworkNode[]): NetworkEdge[] => {
  const edges: NetworkEdge[] = []
  const types: NetworkEdge['type'][] = ['ethernet', 'fiber', 'wireless', 'vpn']
  const statuses: NetworkEdge['status'][] = ['active', 'inactive', 'error']
  
  // Create hierarchical network topology
  const routers = nodes.filter(n => n.type === 'router')
  const switches = nodes.filter(n => n.type === 'switch')
  const firewalls = nodes.filter(n => n.type === 'firewall')
  const servers = nodes.filter(n => n.type === 'server')
  const workstations = nodes.filter(n => n.type === 'workstation')
  const accessPoints = nodes.filter(n => n.type === 'access-point')

  let edgeId = 1

  // Connect routers to each other (core network)
  for (let i = 0; i < routers.length - 1; i++) {
    edges.push({
      id: `edge-${edgeId++}`,
      source: routers[i].id,
      target: routers[i + 1].id,
      type: 'fiber',
      bandwidth: '10Gbps',
      utilization: Math.floor(Math.random() * 80) + 10,
      latency: Math.floor(Math.random() * 5) + 1,
      status: 'active'
    })
  }

  // Connect some routers in a ring for redundancy
  if (routers.length > 2) {
    edges.push({
      id: `edge-${edgeId++}`,
      source: routers[routers.length - 1].id,
      target: routers[0].id,
      type: 'fiber',
      bandwidth: '10Gbps',
      utilization: Math.floor(Math.random() * 60) + 20,
      latency: Math.floor(Math.random() * 5) + 1,
      status: 'active'
    })
  }

  // Connect switches to routers
  switches.forEach((sw, index) => {
    const router = routers[index % routers.length]
    edges.push({
      id: `edge-${edgeId++}`,
      source: router.id,
      target: sw.id,
      type: 'fiber',
      bandwidth: ['1Gbps', '10Gbps'][Math.floor(Math.random() * 2)],
      utilization: Math.floor(Math.random() * 70) + 15,
      latency: Math.floor(Math.random() * 10) + 1,
      status: Math.random() > 0.1 ? 'active' : 'inactive'
    })
  })

  // Connect firewalls to routers
  firewalls.forEach((fw, index) => {
    const router = routers[index % routers.length]
    edges.push({
      id: `edge-${edgeId++}`,
      source: router.id,
      target: fw.id,
      type: 'ethernet',
      bandwidth: '1Gbps',
      utilization: Math.floor(Math.random() * 50) + 10,
      latency: Math.floor(Math.random() * 15) + 2,
      status: 'active'
    })
  })

  // Connect servers to switches
  servers.forEach((srv, index) => {
    const sw = switches[index % switches.length]
    edges.push({
      id: `edge-${edgeId++}`,
      source: sw.id,
      target: srv.id,
      type: 'ethernet',
      bandwidth: ['1Gbps', '10Gbps'][Math.floor(Math.random() * 2)],
      utilization: Math.floor(Math.random() * 60) + 20,
      latency: Math.floor(Math.random() * 8) + 1,
      status: Math.random() > 0.05 ? 'active' : 'error'
    })
  })

  // Connect workstations to switches
  workstations.forEach((ws, index) => {
    const sw = switches[index % switches.length]
    edges.push({
      id: `edge-${edgeId++}`,
      source: sw.id,
      target: ws.id,
      type: 'ethernet',
      bandwidth: '1Gbps',
      utilization: Math.floor(Math.random() * 40) + 5,
      latency: Math.floor(Math.random() * 12) + 2,
      status: Math.random() > 0.1 ? 'active' : 'inactive'
    })
  })

  // Connect access points to switches
  accessPoints.forEach((ap, index) => {
    const sw = switches[index % switches.length]
    edges.push({
      id: `edge-${edgeId++}`,
      source: sw.id,
      target: ap.id,
      type: 'ethernet',
      bandwidth: '1Gbps',
      utilization: Math.floor(Math.random() * 50) + 10,
      latency: Math.floor(Math.random() * 10) + 2,
      status: Math.random() > 0.08 ? 'active' : 'error'
    })
  })

  // Add some cross-connections for redundancy
  for (let i = 0; i < Math.min(10, switches.length - 1); i++) {
    const source = switches[i]
    const target = switches[i + 1]
    
    if (!edges.some(e => 
      (e.source === source.id && e.target === target.id) ||
      (e.source === target.id && e.target === source.id)
    )) {
      edges.push({
        id: `edge-${edgeId++}`,
        source: source.id,
        target: target.id,
        type: 'fiber',
        bandwidth: '1Gbps',
        utilization: Math.floor(Math.random() * 30) + 5,
        latency: Math.floor(Math.random() * 8) + 1,
        status: Math.random() > 0.15 ? 'active' : 'inactive'
      })
    }
  }

  return edges
}

// Generate mock alerts
const generateMockAlerts = (): Alert[] => {
  const severities: Alert['severity'][] = ['critical', 'warning', 'info', 'success']
  const categories: Alert['category'][] = ['network', 'security', 'performance', 'system']
  const sources = [
    'RTR-01', 'RTR-02', 'SW-01', 'SW-05', 'FW-01', 'SRV-03', 'AP-12', 
    'RTR-03', 'SW-08', 'FW-02', 'SRV-07', 'WS-04', 'AP-05'
  ]
  
  const alertTemplates = [
    { title: 'High CPU Usage Detected', description: 'CPU utilization exceeded 90% threshold for 5 minutes', category: 'performance' },
    { title: 'Network Interface Down', description: 'Interface GigabitEthernet0/1 is no longer responding', category: 'network' },
    { title: 'Security Breach Attempt', description: 'Multiple failed SSH login attempts detected from external IP', category: 'security' },
    { title: 'Bandwidth Threshold Exceeded', description: 'Network utilization above 85% on primary uplink', category: 'network' },
    { title: 'Temperature Warning', description: 'Device temperature above normal operating range (>70°C)', category: 'system' },
    { title: 'Backup Process Failed', description: 'Scheduled configuration backup did not complete successfully', category: 'system' },
    { title: 'Certificate Expiring Soon', description: 'SSL certificate expires in 7 days - renewal required', category: 'security' },
    { title: 'Disk Space Low', description: 'Available disk space below 10% on system partition', category: 'system' },
    { title: 'Memory Usage Critical', description: 'Memory utilization exceeded 95% threshold', category: 'performance' },
    { title: 'Link Flapping Detected', description: 'Interface experiencing frequent up/down state changes', category: 'network' },
    { title: 'OSPF Neighbor Down', description: 'OSPF adjacency lost with neighboring router', category: 'network' },
    { title: 'Power Supply Failure', description: 'Redundant power supply unit has failed', category: 'system' },
    { title: 'Intrusion Detection Alert', description: 'Suspicious network traffic pattern detected', category: 'security' },
    { title: 'SNMP Timeout', description: 'Device not responding to SNMP queries', category: 'network' },
    { title: 'Configuration Drift', description: 'Device configuration differs from approved baseline', category: 'security' }
  ]
  
  const alerts: Alert[] = []
  
  for (let i = 0; i < 35; i++) {
    const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    
    // Adjust severity probabilities for more realistic distribution
    const severityProbability = Math.random()
    const finalSeverity = severityProbability > 0.9 ? 'critical' :
                         severityProbability > 0.7 ? 'warning' :
                         severityProbability > 0.4 ? 'info' : 'success'
    
    alerts.push({
      id: `alert-${i}`,
      title: template.title,
      description: template.description,
      severity: finalSeverity,
      category: template.category as Alert['category'],
      source,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
      acknowledged: Math.random() > 0.6,
      resolved: Math.random() > 0.7,
      tags: [template.category, finalSeverity, source.split('-')[0].toLowerCase()],
      metadata: {
        deviceId: `node-${Math.floor(Math.random() * 59) + 1}`,
        threshold: Math.floor(Math.random() * 100),
        currentValue: Math.floor(Math.random() * 100),
        interface: Math.random() > 0.5 ? `GigabitEthernet0/${Math.floor(Math.random() * 8)}` : undefined,
        protocol: Math.random() > 0.7 ? ['OSPF', 'BGP', 'EIGRP'][Math.floor(Math.random() * 3)] : undefined
      }
    })
  }
  
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Generate mock monitoring data
const generateMockMonitoringData = (nodes: NetworkNode[]): MonitoringData => {
  const onlineNodes = nodes.filter(n => n.status === 'online')
  const criticalAlerts = Math.floor(Math.random() * 8) + 2
  
  return {
    network: {
      bandwidth: {
        inbound: generateTimeSeriesData(60, 750, 300),
        outbound: generateTimeSeriesData(60, 450, 200)
      },
      latency: generateTimeSeriesData(60, 28, 15),
      packetLoss: generateTimeSeriesData(60, 0.3, 0.4),
      availability: generateTimeSeriesData(60, 99.2, 0.8)
    },
    devices: nodes.reduce((acc, node) => {
      acc[node.id] = {
        cpu: generateTimeSeriesData(60, node.cpu, 25),
        memory: generateTimeSeriesData(60, node.memory, 20),
        temperature: generateTimeSeriesData(60, node.temperature, 8),
        diskUsage: generateTimeSeriesData(60, Math.random() * 85, 15),
        interfaceUtilization: node.interfaces.reduce((ifaceAcc, iface) => {
          ifaceAcc[iface.id] = generateTimeSeriesData(60, iface.utilization, 25)
          return ifaceAcc
        }, {} as Record<string, MetricData[]>)
      }
      return acc
    }, {} as Record<string, any>),
    summary: {
      totalDevices: nodes.length,
      onlineDevices: onlineNodes.length,
      criticalAlerts,
      averageLatency: 28 + Math.random() * 15,
      networkUptime: 99.2 + Math.random() * 0.8
    }
  }
}

// Generate mock device data for Device Inventory
const generateMockDeviceData = (): NetworkDevice[] => {
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
  
  const deviceTypes: NetworkDevice['type'][] = [
    'router', 'switch', 'firewall', 'server', 'workstation', 'access-point',
    'load-balancer', 'ids-ips', 'hypervisor', 'container-host'
  ]
  
  const statuses: NetworkDevice['status'][] = ['online', 'warning', 'offline', 'unknown']
  
  const osVersions = [
    'IOS 15.6', 'IOS-XE 16.12', 'NX-OS 9.3', 'JunOS 20.4', 'EOS 4.25',
    'Ubuntu 20.04', 'CentOS 8', 'Windows Server 2019', 'ESXi 7.0', 'Proxmox 6.4'
  ]

  const devices: NetworkDevice[] = []
  let deviceId = 1

  // Core Network Infrastructure
  const coreDevices = [
    { type: 'router', count: 12, prefix: 'RTR', vendor: 'Cisco' },
    { type: 'switch', count: 25, prefix: 'SW', vendor: 'Cisco' },
    { type: 'firewall', count: 8, prefix: 'FW', vendor: 'Fortinet' },
    { type: 'load-balancer', count: 6, prefix: 'LB', vendor: 'F5 Networks' },
    { type: 'ids-ips', count: 4, prefix: 'IPS', vendor: 'Palo Alto Networks' }
  ]

  // Server Infrastructure
  const serverDevices = [
    { type: 'server', count: 20, prefix: 'SRV', vendor: 'Dell Technologies' },
    { type: 'hypervisor', count: 15, prefix: 'ESX', vendor: 'VMware' },
    { type: 'container-host', count: 10, prefix: 'K8S', vendor: 'Dell Technologies' }
  ]

  // End-user Devices
  const endUserDevices = [
    { type: 'workstation', count: 35, prefix: 'WS', vendor: 'HP Enterprise' },
    { type: 'access-point', count: 18, prefix: 'AP', vendor: 'Ubiquiti' }
  ]

  const allDeviceGroups = [...coreDevices, ...serverDevices, ...endUserDevices]

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

      // Generate MAC addresses
      const generateMacAddress = () => {
        return Array.from({length: 6}, () => 
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join(':')
      }

      // Generate interfaces based on device type
      const generateInterfaces = (deviceType: string, count: number): NetworkInterface[] => {
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
            ipAddress: j === 0 ? ipv4 : undefined,
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
          { port: 22, protocol: 'tcp' as const, service: 'SSH', version: 'OpenSSH 8.2' },
          { port: 161, protocol: 'udp' as const, service: 'SNMP', version: 'v2c' }
        ]

        const typeSpecificServices: Record<string, ServiceInfo[]> = {
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
          services.push({
            ...service,
            status: Math.random() > 0.1 ? 'open' : 'closed'
          })
        })

        return services
      }

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
        type: type as NetworkDevice['type'],
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
        interfaces: generateInterfaces(type, interfaceCount),
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

export const generateMockData = () => {
  const devices = generateMockDeviceData()
  const nodes = generateMockNodes()
  const edges = generateMockEdges(nodes)
  const alerts = generateMockAlerts()
  const monitoring = generateMockMonitoringData(nodes)
  
  const topology: NetworkTopology = {
    devices,
    connections: edges,
    subnets: [],
    lastUpdated: new Date().toISOString(),
    discoveryStats: {
      totalDevices: devices.length,
      devicesByType: devices.reduce((acc: any, device) => {
        acc[device.type] = (acc[device.type] || 0) + 1
        return acc
      }, {}),
      devicesByStatus: devices.reduce((acc: any, device) => {
        acc[device.status] = (acc[device.status] || 0) + 1
        return acc
      }, {}),
      devicesByLocation: devices.reduce((acc: any, device) => {
        acc[device.location] = (acc[device.location] || 0) + 1
        return acc
      }, {}),
      totalConnections: edges.length,
      discoveryMethods: {},
      lastScanDuration: 120,
      coverage: 95
    }
  }
  
  return {
    topology,
    alerts, 
    monitoring
  }
}