export interface ElevationRequest {
  reason: string
  commands: string[]
  platform: 'windows' | 'linux' | 'darwin'
  requiresElevation: boolean
  timeout: number
}

export interface ElevationResult {
  granted: boolean
  method: 'uac' | 'sudo' | 'none' | 'failed'
  scriptPath?: string
  error?: string
}

export interface ScriptTemplate {
  content: string
  extension: string
  executable: boolean
}

export class PrivilegeManager {
  private static instance: PrivilegeManager
  private currentElevation: ElevationResult | null = null

  static getInstance(): PrivilegeManager {
    if (!PrivilegeManager.instance) {
      PrivilegeManager.instance = new PrivilegeManager()
    }
    return PrivilegeManager.instance
  }

  /**
   * Request elevated privileges for network scanning operations
   */
  async requestElevation(request: ElevationRequest): Promise<ElevationResult> {
    console.log('🔐 Requesting privilege elevation...', request)

    try {
      // Check if elevation is actually needed
      if (!request.requiresElevation) {
        return {
          granted: true,
          method: 'none'
        }
      }

      // Check current privilege level
      const currentLevel = await this.checkCurrentPrivileges()
      if (currentLevel === 'elevated') {
        console.log('✅ Already running with elevated privileges')
        return {
          granted: true,
          method: 'none'
        }
      }

      // Generate elevation script based on platform
      const script = this.generateElevationScript(request)
      
      // In a real implementation, this would:
      // 1. Create the script file
      // 2. Request user consent
      // 3. Execute with elevation
      // 4. Clean up the script
      
      // For browser environment, we simulate the process
      const result = await this.simulateElevationRequest(request, script)
      
      this.currentElevation = result
      return result

    } catch (error) {
      console.error('❌ Elevation request failed:', error)
      return {
        granted: false,
        method: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Generate platform-specific elevation scripts
   */
  private generateElevationScript(request: ElevationRequest): ScriptTemplate {
    switch (request.platform) {
      case 'windows':
        return this.generateWindowsScript(request)
      case 'linux':
        return this.generateLinuxScript(request)
      case 'darwin':
        return this.generateMacOSScript(request)
      default:
        throw new Error(`Unsupported platform: ${request.platform}`)
    }
  }

  /**
   * Generate Windows PowerShell/Batch script with UAC elevation
   */
  private generateWindowsScript(request: ElevationRequest): ScriptTemplate {
    const sanitizedCommands = request.commands.map(cmd => this.sanitizeCommand(cmd))
    const timestamp = new Date().toISOString()
    
    const commandBlocks = sanitizedCommands.map(cmd => {
      const parts = cmd.split(' ')
      const command = parts[0]
      const args = parts.slice(1).join(' ')
      
      return `
        Write-Host "Executing: ${cmd}" -ForegroundColor Cyan
        $result = & ${command} ${args} 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Command completed successfully" -ForegroundColor Green
            $result | Out-String | Write-Output
        } else {
            Write-Host "✗ Command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            $result | Out-String | Write-Error
        }`
    }).join('\n')
    
    const powershellScript = `# Network Discovery Elevation Script
# Generated: ${timestamp}
# Reason: ${request.reason}

param(
    [switch]$Elevated
)

function Test-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not $Elevated) {
    Write-Host "Requesting administrator privileges for network discovery..." -ForegroundColor Yellow
    Write-Host "Reason: ${request.reason}" -ForegroundColor Cyan
    
    # Check if already running as admin
    if (Test-Admin) {
        Write-Host "Already running with administrator privileges." -ForegroundColor Green
        $Elevated = $true
    } else {
        # Request elevation via UAC
        $arguments = "-NoProfile -ExecutionPolicy Bypass -File \`"$PSCommandPath\`" -Elevated"
        Start-Process PowerShell -Verb RunAs -ArgumentList $arguments -Wait
        exit
    }
}

if ($Elevated) {
    Write-Host "Running with elevated privileges..." -ForegroundColor Green
    
    try {
        # Execute network discovery commands${commandBlocks}
        
        Write-Host "Network discovery completed." -ForegroundColor Green
        
    } catch {
        Write-Error "Error during network discovery: $_"
        exit 1
    }
    
    # Clean up - self-delete script
    Write-Host "Cleaning up..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Remove-Item -Path $PSCommandPath -Force -ErrorAction SilentlyContinue
}

# Pause to show results
Read-Host "Press Enter to continue..."`

    return {
      content: powershellScript,
      extension: '.ps1',
      executable: true
    }
  }

  /**
   * Generate Linux bash script with sudo elevation
   */
  private generateLinuxScript(request: ElevationRequest): ScriptTemplate {
    const sanitizedCommands = request.commands.map(cmd => this.sanitizeCommand(cmd))
    
    const commandBlocks = sanitizedCommands.map(cmd => `
    echo -e "\\${'{'}CYAN${'}'}Executing: ${cmd}\\${'{'}NC${'}'}
    if sudo ${cmd}; then
        echo -e "\\${'{'}GREEN${'}'}✓ Command completed successfully\\${'{'}NC${'}'}"
    else
        echo -e "\\${'{'}RED${'}'}✗ Command failed\\${'{'}NC${'}'}"
        exit 1
    fi`).join('\n')
    
    const bashScript = `#!/bin/bash
# Network Discovery Elevation Script
# Generated: $(date -Iseconds)
# Reason: ${request.reason}

set -euo pipefail

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color

echo -e "\\${'{'}YELLOW${'}'}Requesting elevated privileges for network discovery...\\${'{'}NC${'}'}"
echo -e "\\${'{'}CYAN${'}'}Reason: ${request.reason}\\${'{'}NC${'}'}"

# Check if already running as root
if [[ $EUID -eq 0 ]]; then
    echo -e "\\${'{'}GREEN${'}'}Already running with root privileges.\\${'{'}NC${'}'}"
    ELEVATED=true
else
    # Request sudo privileges
    echo -e "\\${'{'}YELLOW${'}'}Please enter your password for sudo access:\\${'{'}NC${'}'}"
    if sudo -v; then
        echo -e "\\${'{'}GREEN${'}'}Sudo access granted.\\${'{'}NC${'}'}"
        ELEVATED=true
    else
        echo -e "\\${'{'}RED${'}'}Failed to obtain sudo access.\\${'{'}NC${'}'}"
        exit 1
    fi
fi

if [[ "$ELEVATED" == "true" ]]; then
    echo -e "\\${'{'}GREEN${'}'}Running with elevated privileges...\\${'{'}NC${'}'}"
    
    # Execute network discovery commands${commandBlocks}
    
    echo -e "\\${'{'}GREEN${'}'}Network discovery completed.\\${'{'}NC${'}'}"
    
    # Clean up - self-delete script
    echo -e "\\${'{'}YELLOW${'}'}Cleaning up...\\${'{'}NC${'}'}"
    sleep 2
    rm -f "$0"
fi

echo "Press Enter to continue..."
read`

    return {
      content: bashScript,
      extension: '.sh',
      executable: true
    }
  }

  /**
   * Generate macOS script with sudo elevation
   */
  private generateMacOSScript(request: ElevationRequest): ScriptTemplate {
    const sanitizedCommands = request.commands.map(cmd => this.sanitizeCommand(cmd))
    
    const commandBlocks = sanitizedCommands.map(cmd => `
    echo "Executing: ${cmd}"
    if echo "$ADMIN_PASS" | sudo -S ${cmd}; then
        echo "✓ Command completed successfully"
    else
        echo "✗ Command failed"
        exit 1
    fi`).join('\n')
    
    const bashScript = `#!/bin/bash
# Network Discovery Elevation Script for macOS
# Generated: $(date -Iseconds)
# Reason: ${request.reason}

set -euo pipefail

# Use osascript for GUI sudo prompt on macOS
echo "Requesting administrator privileges for network discovery..."
echo "Reason: ${request.reason}"

# Try to get admin privileges using AppleScript
ADMIN_PASS=$(osascript -e 'display dialog "Network Discovery requires administrator privileges.\\n\\nReason: ${request.reason}\\n\\nPlease enter your password:" default answer "" with hidden answer' -e 'text returned of result' 2>/dev/null || echo "")

if [[ -z "$ADMIN_PASS" ]]; then
    echo "Administrator access denied or cancelled."
    exit 1
fi

# Verify password by running a simple sudo command
if echo "$ADMIN_PASS" | sudo -S true 2>/dev/null; then
    echo "Administrator access granted."
    
    # Execute network discovery commands${commandBlocks}
    
    echo "Network discovery completed."
    
    # Clean up
    echo "Cleaning up..."
    sleep 2
    rm -f "$0"
else
    echo "Invalid password or insufficient privileges."
    exit 1
fi

echo "Press Enter to continue..."
read`

    return {
      content: bashScript,
      extension: '.sh',
      executable: true
    }
  }

  /**
   * Sanitize command to prevent injection attacks
   */
  private sanitizeCommand(command: string): string {
    // Remove potentially dangerous characters and sequences
    const dangerous = [';', '&&', '||', '|', '>', '<', '`', '$', '(', ')', '{', '}']
    let sanitized = command
    
    dangerous.forEach(char => {
      sanitized = sanitized.replace(new RegExp(`\\${char}`, 'g'), '')
    })
    
    // Whitelist allowed commands for network discovery
    const allowedCommands = [
      'ipconfig', 'arp', 'ping', 'nslookup', 'netstat', 'route',
      'ip', 'ifconfig', 'iwconfig', 'netdiscover', 'nmap',
      'whoami', 'net', 'powershell', 'cmd'
    ]
    
    const commandName = sanitized.trim().split(' ')[0].toLowerCase()
    if (!allowedCommands.some(allowed => commandName.includes(allowed))) {
      throw new Error(`Command not allowed: ${commandName}`)
    }
    
    return sanitized.trim()
  }

  /**
   * Check current privilege level
   */
  private async checkCurrentPrivileges(): Promise<'user' | 'elevated'> {
    // In a real implementation, this would check actual system privileges
    // For browser simulation, we'll return 'user' by default
    return 'user'
  }

  /**
   * Simulate elevation request for browser environment
   */
  private async simulateElevationRequest(
    request: ElevationRequest, 
    script: ScriptTemplate
  ): Promise<ElevationResult> {
    console.log('🔧 Simulating elevation request...')
    console.log('Script content:', script.content.substring(0, 200) + '...')
    
    // Simulate user interaction delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate random success/failure (80% success rate)
    const success = Math.random() > 0.2
    
    if (success) {
      console.log('✅ Elevation granted (simulated)')
      return {
        granted: true,
        method: request.platform === 'windows' ? 'uac' : 'sudo',
        scriptPath: `/tmp/network_discovery${script.extension}`
      }
    } else {
      console.log('❌ Elevation denied (simulated)')
      return {
        granted: false,
        method: 'failed',
        error: 'User denied elevation request'
      }
    }
  }

  /**
   * Create and execute elevation script
   */
  async executeElevatedCommands(
    commands: string[], 
    reason: string, 
    platform: 'windows' | 'linux' | 'darwin'
  ): Promise<{ success: boolean; output: string; error?: string }> {
    try {
      const request: ElevationRequest = {
        reason,
        commands,
        platform,
        requiresElevation: true,
        timeout: 30000
      }
      
      const elevation = await this.requestElevation(request)
      
      if (!elevation.granted) {
        return {
          success: false,
          output: '',
          error: elevation.error || 'Elevation denied'
        }
      }
      
      // Simulate command execution
      console.log('🚀 Executing elevated commands...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock output
      const output = commands.map(cmd => `Executed: ${cmd}\nResult: Success`).join('\n\n')
      
      console.log('✅ Elevated commands completed')
      return {
        success: true,
        output
      }
      
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean up any temporary files or elevated sessions
   */
  async cleanup(): Promise<void> {
    if (this.currentElevation?.scriptPath) {
      console.log('🧹 Cleaning up elevation artifacts...')
      // In real implementation, would delete temporary script files
      this.currentElevation = null
    }
  }

  /**
   * Check if current session has elevated privileges
   */
  isElevated(): boolean {
    return this.currentElevation?.granted === true
  }

  /**
   * Get current elevation status
   */
  getElevationStatus(): ElevationResult | null {
    return this.currentElevation
  }
}

export default PrivilegeManager 