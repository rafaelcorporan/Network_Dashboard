import React, { useState } from 'react'
import { UserProfile, UserRole } from '@/store/slices/userManagementSlice'
import { Mail, Phone, Send, CheckCircle, AlertTriangle, X, Eye, Copy } from 'lucide-react'

interface NotificationServiceProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile
  notificationType: 'welcome' | 'password_reset' | 'account_update' | 'security_alert'
}

interface NotificationTemplate {
  subject: string
  body: string
  type: 'email' | 'sms'
}

const NotificationService: React.FC<NotificationServiceProps> = ({
  isOpen,
  onClose,
  user,
  notificationType
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'email' | 'sms'>('email')
  const [customSubject, setCustomSubject] = useState('')
  const [customBody, setCustomBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const generateWelcomeTemplate = (type: 'email' | 'sms'): NotificationTemplate => {
    const roleDisplayName = {
      client: 'Client User',
      manager: 'Manager',
      localAdmin: 'Local Administrator',
      developer: 'Developer'
    }[user.role]

    if (type === 'email') {
      return {
        subject: `Welcome to NetMonitor - Your ${roleDisplayName} Account is Ready`,
        body: `Dear ${user.firstName} ${user.lastName},

Welcome to NetMonitor! Your ${roleDisplayName} account has been successfully created.

Account Details:
• Email: ${user.email}
• Role: ${roleDisplayName}
• Organization: ${user.organizationId || 'N/A'}
• Account ID: ${user.id}

Getting Started:
1. Visit our platform at https://netmonitor.com/login
2. Use your email address to sign in
3. Check your email for password setup instructions
4. Complete your profile setup

${user.role === 'developer' ? `
IMPORTANT SECURITY NOTICE:
As a developer account, you have elevated privileges. Please:
• Set up multi-factor authentication immediately
• Use a strong, unique password
• Review our security policies
` : ''}

${user.role === 'client' ? `
Your ${user.membershipType} membership includes:
• Real-time network monitoring
• Alert notifications
• Dashboard access
• ${user.membershipType === 'enterprise' ? 'Priority support' : 'Standard support'}
` : ''}

Need help? Contact our support team at support@netmonitor.com

Best regards,
The NetMonitor Team`,
        type: 'email'
      }
    } else {
      return {
        subject: 'NetMonitor Account Created',
        body: `Hi ${user.firstName}! Your NetMonitor ${roleDisplayName} account is ready. Check your email for login details. Welcome aboard!`,
        type: 'sms'
      }
    }
  }

  const generatePasswordResetTemplate = (type: 'email' | 'sms'): NotificationTemplate => {
    if (type === 'email') {
      return {
        subject: 'NetMonitor - Password Reset Request',
        body: `Dear ${user.firstName} ${user.lastName},

A password reset has been requested for your NetMonitor account.

Account: ${user.email}
Request Time: ${new Date().toLocaleString()}
IP Address: 192.168.1.1

If you requested this reset, please use the link below:
https://netmonitor.com/reset-password?token=mock-token-${user.id}

This link will expire in 24 hours.

If you did not request this reset, please ignore this email and contact support immediately.

Best regards,
The NetMonitor Security Team`,
        type: 'email'
      }
    } else {
      return {
        subject: 'Password Reset',
        body: `NetMonitor: Password reset requested for ${user.email}. Check your email for reset link. If not requested, contact support.`,
        type: 'sms'
      }
    }
  }

  const generateAccountUpdateTemplate = (type: 'email' | 'sms'): NotificationTemplate => {
    if (type === 'email') {
      return {
        subject: 'NetMonitor - Account Updated',
        body: `Dear ${user.firstName} ${user.lastName},

Your NetMonitor account has been updated by an administrator.

Changes may include:
• Role or permission modifications
• Contact information updates
• Membership tier changes
• Security settings

If you have questions about these changes, please contact your administrator or our support team.

Best regards,
The NetMonitor Team`,
        type: 'email'
      }
    } else {
      return {
        subject: 'Account Updated',
        body: `NetMonitor: Your account has been updated by an administrator. Check your email for details.`,
        type: 'sms'
      }
    }
  }

  const generateSecurityAlertTemplate = (type: 'email' | 'sms'): NotificationTemplate => {
    if (type === 'email') {
      return {
        subject: 'NetMonitor - Security Alert',
        body: `Dear ${user.firstName} ${user.lastName},

SECURITY ALERT: Unusual activity detected on your NetMonitor account.

Activity Details:
• Time: ${new Date().toLocaleString()}
• Action: Administrative account modification
• IP Address: 192.168.1.1
• User Agent: ${navigator.userAgent}

If this was authorized, no action is needed. If you suspect unauthorized access:
1. Change your password immediately
2. Review your account activity
3. Contact security@netmonitor.com

Best regards,
The NetMonitor Security Team`,
        type: 'email'
      }
    } else {
      return {
        subject: 'Security Alert',
        body: `NetMonitor SECURITY ALERT: Unusual activity on your account. Check your email immediately or contact security@netmonitor.com`,
        type: 'sms'
      }
    }
  }

  const getTemplate = (): NotificationTemplate => {
    switch (notificationType) {
      case 'welcome':
        return generateWelcomeTemplate(selectedTemplate)
      case 'password_reset':
        return generatePasswordResetTemplate(selectedTemplate)
      case 'account_update':
        return generateAccountUpdateTemplate(selectedTemplate)
      case 'security_alert':
        return generateSecurityAlertTemplate(selectedTemplate)
      default:
        return generateWelcomeTemplate(selectedTemplate)
    }
  }

  const handleSendNotification = async () => {
    setIsSending(true)
    setSendResult(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const template = getTemplate()
      const finalSubject = customSubject || template.subject
      const finalBody = customBody || template.body

      // Mock sending logic
      console.log('Sending notification:', {
        to: selectedTemplate === 'email' ? user.email : user.phone,
        type: selectedTemplate,
        subject: finalSubject,
        body: finalBody
      })

      setSendResult({
        success: true,
        message: `${selectedTemplate === 'email' ? 'Email' : 'SMS'} sent successfully to ${selectedTemplate === 'email' ? user.email : user.phone}`
      })
    } catch (error) {
      setSendResult({
        success: false,
        message: 'Failed to send notification. Please try again.'
      })
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (!isOpen) return null

  const template = getTemplate()
  const finalSubject = customSubject || template.subject
  const finalBody = customBody || template.body

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-primary-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Send Notification</h2>
              <p className="text-neutral-400 text-sm">
                Send {notificationType.replace('_', ' ')} notification to {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Configuration */}
            <div className="space-y-6">
              {/* Recipient Info */}
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Recipient</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Name:</span>
                    <span className="text-white">{user.firstName} {user.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Email:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Phone:</span>
                      <span className="text-white">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Role:</span>
                    <span className="text-white capitalize">{user.role}</span>
                  </div>
                </div>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Delivery Method
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTemplate('email')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      selectedTemplate === 'email'
                        ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                        : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('sms')}
                    disabled={!user.phone}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      selectedTemplate === 'sms'
                        ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                        : user.phone
                        ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                        : 'border-neutral-800 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    SMS {!user.phone && '(No phone)'}
                  </button>
                </div>
              </div>

              {/* Custom Subject */}
              {selectedTemplate === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Subject (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder={template.subject}
                  />
                </div>
              )}

              {/* Custom Body */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Message (Optional Override)
                </label>
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none"
                  placeholder={template.body}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSendNotification}
                  disabled={isSending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send {selectedTemplate === 'email' ? 'Email' : 'SMS'}
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
              </div>

              {/* Send Result */}
              {sendResult && (
                <div className={`p-4 rounded-lg border ${
                  sendResult.success
                    ? 'bg-success-500/20 border-success-500/30'
                    : 'bg-error-500/20 border-error-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {sendResult.success ? (
                      <CheckCircle className="w-5 h-5 text-success-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-error-400" />
                    )}
                    <span className={`font-medium ${
                      sendResult.success ? 'text-success-400' : 'text-error-400'
                    }`}>
                      {sendResult.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    sendResult.success ? 'text-success-300' : 'text-error-300'
                  }`}>
                    {sendResult.message}
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Preview</h3>
                <button
                  onClick={() => copyToClipboard(selectedTemplate === 'email' ? `Subject: ${finalSubject}\n\n${finalBody}` : finalBody)}
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              
              <div className="bg-neutral-800/50 rounded-lg p-4 h-[500px] overflow-y-auto">
                {selectedTemplate === 'email' ? (
                  <div className="space-y-4">
                    <div className="border-b border-neutral-700 pb-3">
                      <div className="text-xs text-neutral-400 mb-1">Subject:</div>
                      <div className="text-white font-medium">{finalSubject}</div>
                    </div>
                    <div className="text-xs text-neutral-400 mb-1">Body:</div>
                    <div className="text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {finalBody}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs text-neutral-400 mb-1">SMS Message:</div>
                    <div className="text-neutral-300 text-sm leading-relaxed">
                      {finalBody}
                    </div>
                    <div className="text-xs text-neutral-400 mt-4">
                      Character count: {finalBody.length}/160
                      {finalBody.length > 160 && (
                        <span className="text-warning-400 ml-2">
                          (Will be sent as multiple messages)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-700">
          <div className="text-sm text-neutral-400">
            Notification will be sent to {selectedTemplate === 'email' ? user.email : user.phone}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationService 