"use client"

const Legend = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 p-4 rounded-lg backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-3">Forest Density</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-red-600 to-red-500"></div>
          <span className="text-sm">80-100%</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-yellow-400 to-yellow-300"></div>
          <span className="text-sm">60-80%</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-green-500 to-green-400"></div>
          <span className="text-sm">40-60%</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-cyan-500 to-cyan-400"></div>
          <span className="text-sm">20-40%</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-600 to-blue-500"></div>
          <span className="text-sm">0-20%</span>
        </div>
      </div>
    </div>
  )
}

export default Legend

