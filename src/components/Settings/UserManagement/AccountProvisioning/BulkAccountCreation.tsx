import React, { useState } from 'react';
import { X, Upload, Download, Users, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkAccountCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (users: any[]) => void;
  userType?: 'client' | 'manager' | 'admin' | 'developer';
}

const BulkAccountCreation: React.FC<BulkAccountCreationProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userType = 'client'
}) => {
  const [csvData, setCsvData] = useState<string>('');
  const [parsedUsers, setParsedUsers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
        parseCSV(text);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const users: any[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const user: any = {};
        headers.forEach((header, index) => {
          user[header.toLowerCase()] = values[index];
        });
        users.push(user);
      } else {
        parseErrors.push(`Line ${i + 1}: Invalid format`);
      }
    }

    setParsedUsers(users);
    setErrors(parseErrors);
  };

  const handleSubmit = () => {
    if (parsedUsers.length > 0) {
      setIsProcessing(true);
      onSubmit(parsedUsers);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 2000);
    }
  };

  const downloadTemplate = () => {
    const template = 'firstName,lastName,email,department\nJohn,Doe,john.doe@example.com,IT\nJane,Smith,jane.smith@example.com,HR';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_users_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Bulk Account Creation - {userType.charAt(0).toUpperCase() + userType.slice(1)}s
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Step 1: Download Template
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Download the CSV template with the required column format.
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </button>
          </div>

          {/* File Upload */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Step 2: Upload CSV File
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Upload your completed CSV file with user data.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="font-medium text-red-900 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Parsing Errors
              </h3>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {parsedUsers.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Preview ({parsedUsers.length} users)
              </h3>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(parsedUsers[0] || {}).map(key => (
                        <th key={key} className="px-2 py-1 text-left font-medium text-gray-700 capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedUsers.slice(0, 5).map((user, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        {Object.values(user).map((value: any, idx) => (
                          <td key={idx} className="px-2 py-1 text-gray-600">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedUsers.length > 5 && (
                  <p className="text-gray-500 text-xs mt-2">
                    ... and {parsedUsers.length - 5} more users
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={parsedUsers.length === 0 || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Create {parsedUsers.length} Accounts
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAccountCreation; 