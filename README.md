# Enterprise Network Monitoring Dashboard

A comprehensive, enterprise-grade network monitoring solution built with React, TypeScript, and modern web technologies. This dashboard provides real-time network discovery, device management, user administration, and security monitoring capabilities for enterprise environments.

![Dashboard Preview](https://via.placeholder.com/800x400/1f2937/ffffff?text=Enterprise+Network+Dashboard)

## 🌟 Key Features

### 🌐 Real-Time Network Discovery
- **Multi-Protocol Scanning**: ARP, ICMP ping sweeps, DNS lookups, SNMP discovery
- **Cross-Platform Privilege Elevation**: Windows UAC, Linux/macOS sudo support
- **Intelligent Data Pipeline**: Seamless switching between live and mock data
- **Interactive Network Topology**: Cytoscape.js-powered visualization with device relationships

### 👥 Comprehensive User Management
- **Role-Based Access Control (RBAC)**: 4-tier hierarchy with granular permissions
- **Multi-Tenant Architecture**: Organization and team-based isolation
- **Audit Logging**: Complete trail of administrative actions
- **Bulk Account Management**: Efficient user provisioning and lifecycle management

### 📊 Advanced Monitoring & Analytics
- **Real-Time Metrics Dashboard**: CPU, memory, network utilization tracking
- **Alert Management**: Severity-based alerting with customizable rules
- **Interactive Charts**: Multiple visualization libraries (Chart.js, D3.js, Recharts)
- **Performance Analytics**: Historical data analysis and trending

### 🔒 Enterprise Security
- **Command Sanitization**: Prevents injection attacks with whitelisted commands
- **Secure Session Management**: JWT-based authentication with timeout
- **Compliance Ready**: SOC 2, ISO 27001, GDPR preparation
- **Comprehensive Audit Trail**: All user actions logged for compliance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern browser (Chrome, Firefox, Safari, Edge)
- Network access for live discovery features

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd enterprise-network-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### First Run

1. **Access the Dashboard**: Navigate to `http://localhost:5173`
2. **Explore Mock Data**: Dashboard initializes with realistic mock network data
3. **Enable Live Discovery**: Go to Network Topology → Live Scan → Enable Real Data Collection
4. **Grant Privileges** (Optional): Click "Elevate" for enhanced network scanning
5. **Start Scanning**: Begin real network discovery with "Start Scan"

## 📖 Documentation

### User Guides
- [Getting Started Guide](docs/getting-started.md)
- [Network Discovery Tutorial](docs/network-discovery.md)
- [User Management Guide](docs/user-management.md)
- [Security Configuration](docs/security-setup.md)

### Technical Documentation
- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🏗️ Architecture

### Frontend Stack
- **React 18**: Modern functional components with hooks
- **TypeScript**: Full type safety and developer experience
- **Redux Toolkit**: Centralized state management with RTK Query
- **Tailwind CSS**: Utility-first styling with responsive design
- **Vite**: Fast build tool with HMR and optimization

### Key Libraries
- **Visualization**: Cytoscape.js, D3.js, Chart.js, Recharts
- **UI/UX**: Framer Motion, Lucide React, React Hook Form
- **Network**: Socket.io-client, Axios
- **Validation**: Zod schemas with React Hook Form
- **Utils**: date-fns, clsx, tailwind-merge

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # App layout and navigation
│   ├── NetworkTopology/ # Network visualization
│   ├── DeviceInventory/ # Device management
│   ├── Monitoring/     # Real-time monitoring
│   ├── Alerts/         # Alert management
│   ├── Analytics/      # Data analytics
│   └── Settings/       # Configuration and user management
├── pages/              # Route components
├── services/           # Business logic and external APIs
│   ├── NetworkScanner.ts    # Network discovery engine
│   ├── PrivilegeManager.ts  # Cross-platform privilege elevation
│   └── DataPipeline.ts      # Intelligent data management
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and mock data
```

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Feature Flags
VITE_ENABLE_REAL_NETWORK_DISCOVERY=true
VITE_ENABLE_MOCK_DATA_FALLBACK=true

# Security Settings
VITE_SESSION_TIMEOUT=3600
VITE_ENABLE_MFA=false
```

### Network Discovery Settings
```typescript
// Configure scanning parameters
const scanConfig = {
  interval: 300000,        // 5 minutes
  timeout: 60000,         // 60 seconds
  concurrency: 10,        // Parallel scans
  fallbackEnabled: true   // Auto-fallback to mock data
}
```

## 👥 User Roles & Permissions

### Role Hierarchy
1. **Client**: Basic monitoring and view access
2. **Manager**: Team management and reporting
3. **LocalAdmin**: Full organizational administration
4. **Developer**: System configuration and advanced features

### Permission Matrix
| Feature | Client | Manager | LocalAdmin | Developer |
|---------|---------|---------|------------|-----------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Network Discovery | ❌ | ✅ | ✅ | ✅ |
| User Management | ❌ | Limited | ✅ | ✅ |
| System Settings | ❌ | ❌ | Limited | ✅ |
| Audit Logs | ❌ | Limited | ✅ | ✅ |

## 🔒 Security Features

### Network Scanning Security
- **Local Networks Only**: Restricted to private IP ranges (10.x, 172.16-31.x, 192.168.x)
- **Command Whitelisting**: Only network discovery tools allowed
- **Rate Limiting**: Configurable concurrency to prevent network flooding
- **Privilege Management**: Secure elevation with audit logging

### Application Security
- **Input Validation**: Zod schema validation on all forms
- **XSS Prevention**: Content Security Policy and sanitization
- **CSRF Protection**: Token-based request validation
- **Session Security**: Secure cookies with timeout

### Compliance Features
- **Audit Logging**: Comprehensive action tracking
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Access Controls**: Role-based permissions with principle of least privilege
- **Data Retention**: Configurable retention policies

## 📊 Performance & Monitoring

### Performance Metrics
- **Page Load Time**: < 2 seconds for dashboard
- **API Response Time**: < 500ms for most operations
- **Network Scan Duration**: < 60 seconds for typical subnets
- **Real-Time Updates**: < 2 second latency for live data

### Monitoring Features
- **Application Performance**: Built-in performance tracking
- **Error Boundary**: Graceful error handling and recovery
- **Loading States**: Enhanced UX with progress indicators
- **Memory Management**: Automatic cleanup of resources

## 🌐 Browser Support

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 90+ | Full Support |
| Firefox | 88+ | Full Support |
| Safari | 14+ | Full Support |
| Edge | 90+ | Full Support |

### Mobile Support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Touch Optimization**: Touch-friendly interface elements
- **Progressive Enhancement**: Core features work on all devices

## 🚀 Deployment Options

### Development
```bash
npm run dev          # Development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint code analysis
```

### Production Deployment

#### Option 1: Static Hosting
```bash
npm run build
# Deploy dist/ folder to any static hosting service
```

#### Option 2: Docker Container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### Option 3: Electron Desktop App
```bash
# Install Electron wrapper
npm install electron electron-builder

# Build desktop application
npm run electron:build
```

## 📱 Integration Examples

### WebSocket Integration
```typescript
import io from 'socket.io-client'

const socket = io(process.env.VITE_WS_URL)

socket.on('networkUpdate', (data) => {
  dispatch(updateNetworkTopology(data))
})
```

### REST API Integration
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000
})

// Get network devices
const devices = await api.get('/api/v1/devices')
```

### Custom Plugin Development
```typescript
// Create custom monitoring plugin
export interface MonitoringPlugin {
  name: string
  initialize(): Promise<void>
  collect(): Promise<MetricData[]>
  cleanup(): void
}
```

## 🛠️ Development

### Development Environment Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm run test
```

### Code Quality Tools
- **TypeScript**: Full type checking and IntelliSense
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality gates

### Contributing Guidelines
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

#### Network Discovery Not Working
```bash
# Check browser permissions
console.log('Checking network access...')

# Verify privilege elevation
sudo -v  # Linux/macOS
# Run as Administrator (Windows)
```

#### Performance Issues
```bash
# Clear browser cache
# Reduce scan concurrency
# Check network connectivity
# Verify system resources
```

#### Authentication Problems
```bash
# Clear localStorage
localStorage.clear()

# Check session timeout
# Verify CORS settings
# Check network connectivity
```

### Getting Help
- 📚 **Documentation**: Check docs/ folder for detailed guides
- 🐛 **Bug Reports**: Open issue with reproduction steps
- 💬 **Discussions**: Join community discussions
- 📧 **Support**: Contact support for enterprise customers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the amazing React framework
- **Redux Team**: For powerful state management
- **Cytoscape.js**: For network visualization capabilities
- **Tailwind CSS**: For utility-first styling
- **Open Source Community**: For the countless libraries that make this possible

## 📈 Roadmap

### Version 2.0 (Planned)
- [ ] IPv6 Support
- [ ] VLAN Discovery
- [ ] Service Fingerprinting
- [ ] Advanced SNMP Support
- [ ] Machine Learning Analytics

### Version 3.0 (Future)
- [ ] Cloud Integration (AWS, Azure, GCP)
- [ ] Kubernetes Network Monitoring
- [ ] AI-Powered Anomaly Detection
- [ ] Mobile Application
- [ ] Advanced Compliance Reporting

---

**Built with ❤️ for Enterprise IT Teams**

For more information, visit our [documentation](docs/) or [open an issue](issues/) for support.