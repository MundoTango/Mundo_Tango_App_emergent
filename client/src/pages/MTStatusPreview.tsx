/**
 * MT Status Preview Page
 * Shows platform status and agent operational metrics
 */

import { Card } from "@/components/ui/card";
import { CheckCircle, Activity } from "lucide-react";

export default function MTStatusPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Activity className="h-16 w-16 text-turquoise-500 mx-auto mb-4" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Mundo Tango Status
          </h1>
          <p className="text-xl text-gray-700">Platform operational metrics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">122 / 276</h3>
            <p className="text-gray-600">Agents Operational</p>
            <p className="text-sm text-gray-500 mt-2">44.2%</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">13 / 13</h3>
            <p className="text-gray-600">Agent Categories</p>
            <p className="text-sm text-gray-500 mt-2">100%</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Operational</h3>
            <p className="text-gray-600">Server Status</p>
            <p className="text-sm text-gray-500 mt-2">Port 5000</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Categories</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">ESA Infrastructure</span>
              <span className="text-green-600">60 agents</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">Leadership & Management</span>
              <span className="text-green-600">14 agents</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">Algorithm Agents</span>
              <span className="text-green-600">10 agents</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">Specialized Services</span>
              <span className="text-green-600">10 agents</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">Mr Blue Suite</span>
              <span className="text-green-600">8 agents</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">Operational Excellence</span>
              <span className="text-green-600">5 agents</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">Journey Agents</span>
              <span className="text-green-600">4 agents</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">UI Sub-Agents</span>
              <span className="text-green-600">3 agents</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
