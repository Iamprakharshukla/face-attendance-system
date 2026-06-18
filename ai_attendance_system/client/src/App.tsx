import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Webcam as WebcamIcon, 
  Video, 
  Upload, 
  Mail, 
  Search, 
  LogOut, 
  User, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3, 
  Calendar,
  X,
  FileSpreadsheet,
  Camera,
  Sun,
  Moon,
  Users,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// API base URL - empty for Flask dev, set to Render URL for Vercel deployment
const API_BASE = import.meta.env.VITE_API_BASE || '';

interface AttendanceRecord {
  Date: string;
  Time: string;
  Person_Name: string;
  Confidence: string;
  Status: string;
  Source: string;
}

interface StreamStats {
  frames_processed: number;
  faces_detected: number;
  faces_recognized: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'webcam' | 'ipcam' | 'upload'>('dashboard');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    unknown: 0,
    rate: 0
  });
  
  // Theme Toggle
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Date Filters
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  
  // Modals & Profile
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [includeCSV, setIncludeCSV] = useState(true);
  
  // Registration Form
  const [personName, setPersonName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [registerStatus, setRegisterStatus] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Webcam & IP Cam State
  const [webcamActive, setWebcamActive] = useState(false);
  const [ipUrl, setIpUrl] = useState('');
  const [ipActive, setIpActive] = useState(false);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    frames_processed: 0,
    faces_detected: 0,
    faces_recognized: 0
  });

  // Fetch Attendance Records
  const fetchTodayAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/today-attendance`);
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
        calculateStats(data.records);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  const calculateStats = (recs: AttendanceRecord[]) => {
    const total = recs.length;
    const present = recs.filter(r => r.Person_Name !== 'Unknown').length;
    const unknown = total - present;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    setStats({ total, present, unknown, rate });
  };

  useEffect(() => {
    fetchTodayAttendance();
    const interval = setInterval(fetchTodayAttendance, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter Search
  const handleSearch = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/attendance-report?start_date=${startDate}&end_date=${endDate}`);
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
        calculateStats(data.records);
      }
    } catch (err) {
      alert("Error generating report: " + err);
    }
  };

  // Export CSV
  const handleExportCSV = (type: 'attendance' | 'unknown') => {
    window.location.href = `${API_BASE}/admin/export-${type === 'attendance' ? 'attendance' : 'unknown-faces'}`;
  };

  // Submit Email Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportEmail) return;
    setRegisterStatus({ message: 'Sending email report...', type: 'info' });
    try {
      const res = await fetch(`${API_BASE}/email/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reportEmail, include_csv: includeCSV })
      });
      const data = await res.json();
      if (res.ok) {
        setRegisterStatus({ message: 'Email report sent successfully!', type: 'success' });
        setIsReportModalOpen(false);
      } else {
        setRegisterStatus({ message: 'Failed: ' + data.error, type: 'error' });
      }
    } catch (err) {
      setRegisterStatus({ message: 'Error: ' + err, type: 'error' });
    }
  };

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Submit Photo Upload
  const handlePhotoUpload = async () => {
    if (!personName) {
      setRegisterStatus({ message: 'Please enter a name first', type: 'error' });
      return;
    }
    if (!photoFile) return;

    const formData = new FormData();
    formData.append('file', photoFile);
    formData.append('person_name', personName);

    setRegisterStatus({ message: 'Uploading and processing face image...', type: 'info' });

    try {
      const res = await fetch(`${API_BASE}/upload/photo`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setRegisterStatus({ message: `Success! Registered ${personName}. Detected ${data.faces_detected} face(s).`, type: 'success' });
        setPhotoFile(null);
        setPhotoPreview(null);
        setPersonName('');
        fetchTodayAttendance();
      } else {
        setRegisterStatus({ message: 'Error: ' + data.error, type: 'error' });
      }
    } catch (err) {
      setRegisterStatus({ message: 'Error: ' + err, type: 'error' });
    }
  };

  // Submit Video Upload
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleVideoUpload = async () => {
    if (!personName) {
      setRegisterStatus({ message: 'Please enter a name first', type: 'error' });
      return;
    }
    if (!videoFile) return;

    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('person_name', personName);

    setRegisterStatus({ message: 'Uploading and analyzing video. This might take a moment...', type: 'info' });

    try {
      const res = await fetch(`${API_BASE}/upload/video`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setRegisterStatus({ message: `Success! Extracted faces and registered ${personName}. ${data.total_faces} faces processed.`, type: 'success' });
        setVideoFile(null);
        setPersonName('');
        fetchTodayAttendance();
      } else {
        setRegisterStatus({ message: 'Error: ' + data.error, type: 'error' });
      }
    } catch (err) {
      setRegisterStatus({ message: 'Error: ' + err, type: 'error' });
    }
  };

  // Poll stream statistics when active
  useEffect(() => {
    let statsInterval: any;
    if (webcamActive || ipActive) {
      statsInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/camera/stream-stats`);
          const data = await res.json();
          setStreamStats(data);
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => clearInterval(statsInterval);
  }, [webcamActive, ipActive]);

  const toggleWebcam = async () => {
    if (webcamActive) {
      await fetch(`${API_BASE}/camera/stop-stream`, { method: 'POST' });
      setWebcamActive(false);
    } else {
      setWebcamActive(true);
      setIpActive(false);
    }
  };

  const toggleIpCam = async () => {
    if (ipActive) {
      await fetch(`${API_BASE}/camera/stop-stream`, { method: 'POST' });
      setIpActive(false);
    } else {
      if (!ipUrl) {
        alert("Please enter a valid IP Stream URL");
        return;
      }
      setIpActive(true);
      setWebcamActive(false);
    }
  };

  // Prepare chart data (group by time/hour)
  const getChartData = () => {
    const hours = Array.from({ length: 9 }, (_, i) => `${i + 9}:00`);
    return hours.map(h => {
      const count = records.filter(r => r.Time.startsWith(h.split(':')[0])).length;
      return { time: h, checkins: count };
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b py-4 px-6 md:px-12 flex justify-between items-center shadow-lg transition-all">
        <div className="flex items-center gap-3">
          <div className="icon-3d-primary">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight dark:text-white text-slate-900">
              BiometricAI
            </h1>
            <p className="text-[9px] dark:text-slate-400 text-slate-500 font-bold tracking-widest uppercase">Face Attendance Platform</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={activeTab === 'dashboard' ? 'btn-3d-primary-sm' : 'btn-3d-secondary-sm'}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('register')} 
            className={activeTab === 'register' ? 'btn-3d-primary-sm' : 'btn-3d-secondary-sm'}
          >
            Register Face
          </button>
          <button 
            onClick={() => setActiveTab('webcam')} 
            className={activeTab === 'webcam' ? 'btn-3d-primary-sm' : 'btn-3d-secondary-sm'}
          >
            Live Webcam
          </button>
          <button 
            onClick={() => setActiveTab('ipcam')} 
            className={activeTab === 'ipcam' ? 'btn-3d-primary-sm' : 'btn-3d-secondary-sm'}
          >
            IP Camera
          </button>
          <button 
            onClick={() => setActiveTab('upload')} 
            className={activeTab === 'upload' ? 'btn-3d-primary-sm' : 'btn-3d-secondary-sm'}
          >
            Media Upload
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle Button */}
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="w-10 h-10 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-white flex items-center justify-center hover:scale-[1.05] active:scale-[0.95] transition-all shadow-md"
            style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.1)' }}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)} 
            className="w-10 h-10 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-white flex items-center justify-center hover:scale-[1.05] active:scale-[0.95] transition-all shadow-md"
            style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.1)' }}
          >
            <User className="w-5 h-5 text-primary-500" />
          </button>
          <a 
            href="/auth/logout" 
            className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 dark:text-rose-300 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* Registration Alerts banner */}
        <AnimatePresence>
          {registerStatus && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-2xl border flex items-center justify-between shadow-2xl glass-panel ${
                registerStatus.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500 dark:text-emerald-300' :
                registerStatus.type === 'error' ? 'border-rose-500/30 bg-rose-500/5 text-rose-500 dark:text-rose-300' :
                'border-sky-500/30 bg-sky-500/5 text-sky-500 dark:text-sky-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {registerStatus.type === 'success' && <CheckCircle className="w-5 h-5 animate-bounce" />}
                {registerStatus.type === 'error' && <AlertTriangle className="w-5 h-5 animate-pulse" />}
                {registerStatus.type === 'info' && <RefreshCw className="w-5 h-5 animate-spin" />}
                <p className="text-sm font-semibold">{registerStatus.message}</p>
              </div>
              <button onClick={() => setRegisterStatus(null)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Selection Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Premium Stat Cards with 3D tactile icons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="card-3d flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Total Logs</span>
                    <div className="icon-3d-primary"><Users className="w-5 h-5" /></div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">{stats.total}</h3>
                    <p className="text-[10px] dark:text-slate-500 text-slate-400 font-bold mt-1">Logs recorded today</p>
                  </div>
                </div>

                <div className="card-3d flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Present</span>
                    <div className="icon-3d-emerald"><ShieldCheck className="w-5 h-5" /></div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-emerald-500 dark:text-emerald-400">{stats.present}</h3>
                    <p className="text-[10px] dark:text-slate-500 text-slate-400 font-bold mt-1">Known faces matched</p>
                  </div>
                </div>

                <div className="card-3d flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Unknown</span>
                    <div className="icon-3d-amber"><AlertTriangle className="w-5 h-5" /></div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-amber-500 dark:text-amber-400">{stats.unknown}</h3>
                    <p className="text-[10px] dark:text-slate-500 text-slate-400 font-bold mt-1">Unregistered checks</p>
                  </div>
                </div>

                <div className="card-3d flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Match Rate</span>
                    <div className="icon-3d-sky"><Zap className="w-5 h-5" /></div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-sky-500 dark:text-sky-400">{stats.rate}%</h3>
                    <p className="text-[10px] dark:text-slate-500 text-slate-400 font-bold mt-1">Confidence rating average</p>
                  </div>
                </div>
              </div>

              {/* Chart & Report Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Area Chart */}
                <div className="card-3d lg:col-span-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-extrabold flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary-500" /> Activity Distribution
                      </h3>
                      <p className="text-[11px] dark:text-slate-400 text-slate-500 font-medium">Total match occurrences grouped by hours</p>
                    </div>
                    <button onClick={fetchTodayAttendance} className="p-2 bg-white/5 border dark:border-white/5 border-slate-200 rounded-xl hover:bg-slate-500/10 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#757fff" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#757fff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff0a" : "#0000000a"} />
                        <XAxis dataKey="time" stroke={isDark ? "#94a3b8" : "#475569"} style={{ fontSize: 10, fontWeight: 600 }} />
                        <YAxis stroke={isDark ? "#94a3b8" : "#475569"} style={{ fontSize: 10, fontWeight: 600 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                            borderColor: isDark ? '#334155' : '#e2e8f0', 
                            borderRadius: '16px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }} 
                          itemStyle={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                          labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="checkins" stroke="#757fff" strokeWidth={3} fillOpacity={1} fill="url(#colorCheckins)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Dashboard Controls */}
                <div className="card-3d flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" /> Date Range Filter
                    </h3>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 font-medium mb-6">Specify range to scan historical data</p>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Start Date</label>
                        <input 
                          type="date" 
                          value={startDate} 
                          onChange={(e) => setStartDate(e.target.value)} 
                          className="input-3d w-full" 
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">End Date</label>
                        <input 
                          type="date" 
                          value={endDate} 
                          onChange={(e) => setEndDate(e.target.value)} 
                          className="input-3d w-full" 
                        />
                      </div>
                      <button onClick={handleSearch} className="btn-3d-primary w-full mt-2">
                        <Search className="w-4 h-4" /> Filter Records
                      </button>
                    </div>
                  </div>

                  <div className="border-t dark:border-white/5 border-slate-200/80 pt-6 mt-6 grid grid-cols-2 gap-3">
                    <button onClick={() => handleExportCSV('attendance')} className="btn-3d-secondary py-2.5 text-xs">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export All
                    </button>
                    <button onClick={() => setIsReportModalOpen(true)} className="btn-3d-primary py-2.5 text-xs">
                      <Mail className="w-4 h-4" /> Email Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Records Table */}
              <div className="card-3d overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold">Recent Logs</h3>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 font-medium">Chronological history of face recognitions</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b dark:border-white/5 border-slate-200/80 dark:text-slate-400 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-6">Person Name</th>
                        <th className="py-4 px-6">Source</th>
                        <th className="py-4 px-6">Confidence</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-white/5 divide-slate-200/80 text-sm">
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                            No logs registered for selected duration
                          </td>
                        </tr>
                      ) : (
                        records.map((record, index) => (
                          <tr key={index} className="hover:bg-slate-500/5 transition-colors">
                            <td className="py-4 px-6">
                              <span className="font-semibold">{record.Date}</span>
                              <span className="dark:text-slate-400 text-slate-500 ml-2 text-xs font-medium">{record.Time}</span>
                            </td>
                            <td className="py-4 px-6 font-bold flex items-center gap-2">
                              {record.Person_Name === 'Unknown' ? (
                                <span className="text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4" /> Unknown Face
                                </span>
                              ) : (
                                record.Person_Name
                              )}
                            </td>
                            <td className="py-4 px-6 dark:text-slate-400 text-slate-500 text-xs font-bold uppercase tracking-widest">{record.Source}</td>
                            <td className="py-4 px-6 font-mono font-bold">
                              {Math.round(parseFloat(record.Confidence) * 100)}%
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                record.Status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'dark:bg-slate-800 bg-slate-200 text-slate-400 text-slate-500'
                              }`}>
                                {record.Status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div 
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto card-3d space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="icon-3d-primary"><UserPlus className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-xl font-black">Register New Face Profile</h3>
                  <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Create a facial encoding template to detect this person in the future</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Person Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter registration name" 
                    value={personName} 
                    onChange={(e) => setPersonName(e.target.value)} 
                    className="input-3d" 
                  />
                </div>

                <div className="border border-dashed dark:border-white/10 border-slate-200 rounded-2xl p-8 text-center bg-slate-900/10 flex flex-col items-center justify-center gap-3 hover:border-primary-500 transition-all cursor-pointer relative"
                  onClick={() => document.getElementById('photoInputEl')?.click()}
                >
                  <input 
                    type="file" 
                    id="photoInputEl" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoSelect} 
                  />
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="max-h-64 rounded-xl shadow-lg border dark:border-white/10 border-slate-200" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }} 
                        className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 rounded-full shadow-lg text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="icon-3d-slate">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Upload Face Photo</p>
                        <p className="text-xs dark:text-slate-500 text-slate-400 font-medium mt-1">PNG, JPG, JPEG up to 500MB</p>
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={handlePhotoUpload} 
                  disabled={!photoFile || !personName}
                  className="btn-3d-primary w-full disabled:opacity-50 disabled:pointer-events-none"
                >
                  <UserPlus className="w-4 h-4" /> Add Face Embedding
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'webcam' && (
            <motion.div 
              key="webcam"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Webcam Feed Display */}
              <div className="card-3d lg:col-span-2 flex flex-col justify-between items-center gap-6 relative overflow-hidden min-h-[400px]">
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="icon-3d-rose"><WebcamIcon className="w-5 h-5 animate-pulse" /></div>
                    <div>
                      <h3 className="font-black">Live Webcam Scanner</h3>
                      <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Locates and identifies registered facial encodings in real-time</p>
                    </div>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border border-black/25 ${webcamActive ? 'bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse' : 'bg-slate-400'}`} />
                </div>

                <div className="w-full flex-1 rounded-2xl overflow-hidden bg-slate-900 border dark:border-white/5 border-slate-200/80 shadow-inner flex items-center justify-center min-h-[300px]">
                  {webcamActive ? (
                    <img 
                      src={`${API_BASE}/camera/stream`} 
                      alt="Webcam Live Stream" 
                      className="w-full h-full object-cover" 
                      onError={() => {
                        alert("Camera stream failed to load. Check webcam connection.");
                        setWebcamActive(false);
                      }}
                    />
                  ) : (
                    <div className="text-center p-8 text-slate-500 flex flex-col items-center gap-3">
                      <WebcamIcon className="w-12 h-12 text-slate-700" />
                      <p className="text-sm font-semibold">Webcam Scanner Idle</p>
                      <p className="text-xs max-w-sm">Start webcam to begin detecting and auto-logging present members.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={toggleWebcam} 
                  className={`btn-3d-primary w-full ${webcamActive ? 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500' : ''}`}
                >
                  <WebcamIcon className="w-4 h-4" /> 
                  {webcamActive ? 'Stop Stream Feed' : 'Activate Live Scan'}
                </button>
              </div>

              {/* Stream Statistics */}
              <div className="card-3d space-y-6">
                <div className="flex items-center gap-3">
                  <div className="icon-3d-indigo"><Activity className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-black">Stream Monitoring</h3>
                    <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Metrics from current stream session</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-500/5 border dark:border-white/5 border-slate-200 rounded-xl flex justify-between items-center">
                    <span className="text-xs dark:text-slate-400 text-slate-500 font-bold uppercase">Frames Processed</span>
                    <span className="font-mono text-sm font-black">{streamStats.frames_processed}</span>
                  </div>
                  <div className="p-4 bg-slate-500/5 border dark:border-white/5 border-slate-200 rounded-xl flex justify-between items-center">
                    <span className="text-xs dark:text-slate-400 text-slate-500 font-bold uppercase">Faces Detected</span>
                    <span className="font-mono text-sm font-black text-amber-500">{streamStats.faces_detected}</span>
                  </div>
                  <div className="p-4 bg-slate-500/5 border dark:border-white/5 border-slate-200 rounded-xl flex justify-between items-center">
                    <span className="text-xs dark:text-slate-400 text-slate-500 font-bold uppercase">Recognized Encodings</span>
                    <span className="font-mono text-sm font-black text-emerald-500">{streamStats.faces_recognized}</span>
                  </div>
                </div>

                <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                  <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="w-4 h-4 animate-bounce" /> Live Auto Log Enabled
                  </h4>
                  <p className="text-[11px] dark:text-sky-400/80 text-sky-600/85 leading-relaxed font-medium">
                    Identified faces are instantly matched with known database templates and auto-registered in the attendance log.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ipcam' && (
            <motion.div 
              key="ipcam"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Webcam Feed Display */}
              <div className="card-3d lg:col-span-2 flex flex-col justify-between items-center gap-6 relative overflow-hidden min-h-[400px]">
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="icon-3d-indigo"><Video className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-black">IP Camera Scanner</h3>
                      <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Stream from security cameras or remote RTSP/HTTP endpoints</p>
                    </div>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border border-black/25 ${ipActive ? 'bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse' : 'bg-slate-400'}`} />
                </div>

                <div className="w-full flex-1 rounded-2xl overflow-hidden bg-slate-900 border dark:border-white/5 border-slate-200/80 shadow-inner flex items-center justify-center min-h-[300px]">
                  {ipActive ? (
                    <img 
                      src={`${API_BASE}/camera/ip-stream-display/${encodeURIComponent(ipUrl)}`} 
                      alt="IP Live Stream" 
                      className="w-full h-full object-cover" 
                      onError={() => {
                        alert("IP Camera stream failed. Check URL credentials and stream network access.");
                        setIpActive(false);
                      }}
                    />
                  ) : (
                    <div className="text-center p-8 text-slate-500 flex flex-col items-center gap-3">
                      <Video className="w-12 h-12 text-slate-700" />
                      <p className="text-sm font-semibold">IP Camera Connection Idle</p>
                      <p className="text-xs max-w-sm">Enter the remote IP Camera stream URL below to launch face detection.</p>
                    </div>
                  )}
                </div>

                <div className="w-full flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">IP Camera Stream URL</label>
                  <div className="flex gap-2 w-full">
                    <input 
                      type="text" 
                      placeholder="e.g. rtsp://192.168.1.50:554/stream or http://192.168.1.100:8080/video" 
                      value={ipUrl} 
                      onChange={(e) => setIpUrl(e.target.value)} 
                      disabled={ipActive}
                      className="input-3d flex-1 disabled:opacity-50" 
                    />
                    <button 
                      onClick={toggleIpCam} 
                      className={`btn-3d-primary shrink-0 ${ipActive ? 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500' : ''}`}
                    >
                      {ipActive ? 'Disconnect' : 'Connect Stream'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stream Statistics */}
              <div className="card-3d space-y-6">
                <div className="flex items-center gap-3">
                  <div className="icon-3d-indigo"><Activity className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-black">Stream Monitoring</h3>
                    <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Metrics from current stream session</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-500/5 border dark:border-white/5 border-slate-200 rounded-xl flex justify-between items-center">
                    <span className="text-xs dark:text-slate-400 text-slate-500 font-bold uppercase">Frames Processed</span>
                    <span className="font-mono text-sm font-black">{streamStats.frames_processed}</span>
                  </div>
                  <div className="p-4 bg-slate-500/5 border dark:border-white/5 border-slate-200 rounded-xl flex justify-between items-center">
                    <span className="text-xs dark:text-slate-400 text-slate-500 font-bold uppercase">Faces Detected</span>
                    <span className="font-mono text-sm font-black text-amber-500">{streamStats.faces_detected}</span>
                  </div>
                  <div className="p-4 bg-slate-500/5 border dark:border-white/5 border-slate-200 rounded-xl flex justify-between items-center">
                    <span className="text-xs dark:text-slate-400 text-slate-500 font-bold uppercase">Recognized Encodings</span>
                    <span className="font-mono text-sm font-black text-emerald-500">{streamStats.faces_recognized}</span>
                  </div>
                </div>

                <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
                  <h4 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="w-4 h-4 animate-bounce" /> RTMP/RTSP Feeds
                  </h4>
                  <p className="text-[11px] dark:text-primary-400/80 text-primary-600/85 leading-relaxed font-medium">
                    Connecting to local security systems allows continuous tracking of check-ins without requiring manual scanning from laptops.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Image Recognition Upload */}
              <div className="card-3d flex flex-col justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="icon-3d-indigo"><Upload className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-black">Log Check-in via Photo</h3>
                    <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Scan attendance registers or check-in lists using raw photographs</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-dashed dark:border-white/10 border-slate-200 rounded-2xl p-8 text-center bg-slate-900/10 flex flex-col items-center justify-center gap-3 hover:border-primary-500 transition-all cursor-pointer relative"
                    onClick={() => document.getElementById('photoSelectInput')?.click()}
                  >
                    <input 
                      type="file" 
                      id="photoSelectInput" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoSelect} 
                    />
                    {photoPreview ? (
                      <div className="relative">
                        <img src={photoPreview} alt="Preview" className="max-h-64 rounded-xl shadow-lg border dark:border-white/10 border-slate-200" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoFile(null);
                            setPhotoPreview(null);
                          }} 
                          className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 rounded-full shadow-lg text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="icon-3d-slate">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Click to upload photo</p>
                          <p className="text-xs dark:text-slate-500 text-slate-400 font-medium mt-1">Images containing multiple faces are supported</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign Person Name (Leave blank to match)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Prakhar Shukla (or leave empty)" 
                      value={personName} 
                      onChange={(e) => setPersonName(e.target.value)} 
                      className="input-3d" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handlePhotoUpload} 
                  disabled={!photoFile}
                  className="btn-3d-primary w-full disabled:opacity-50 disabled:pointer-events-none"
                >
                  <CheckCircle className="w-4 h-4" /> Process Check-in Photo
                </button>
              </div>

              {/* Video Log Process */}
              <div className="card-3d flex flex-col justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="icon-3d-indigo"><Video className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-black">Log Check-in via Video</h3>
                    <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Upload recorded security clips to trace matches chronologically</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-dashed dark:border-white/10 border-slate-200 rounded-2xl p-8 text-center bg-slate-900/10 flex flex-col items-center justify-center gap-3 hover:border-primary-500 transition-all cursor-pointer relative"
                    onClick={() => document.getElementById('videoSelectInput')?.click()}
                  >
                    <input 
                      type="file" 
                      id="videoSelectInput" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={handleVideoSelect} 
                    />
                    {videoFile ? (
                      <div className="text-center py-6">
                        <Video className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                        <p className="text-sm font-bold">{videoFile.name}</p>
                        <p className="text-xs dark:text-slate-500 text-slate-400 font-medium mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoFile(null);
                          }} 
                          className="btn-3d-secondary py-1.5 px-3 text-xs mt-3 mx-auto"
                        >
                          Clear File
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="icon-3d-slate">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Click to upload video</p>
                          <p className="text-xs dark:text-slate-500 text-slate-400 font-medium mt-1">MP4, AVI, MOV, MKV up to 500MB</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign Person Name (Leave blank to match)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Prakhar Shukla (or leave empty)" 
                      value={personName} 
                      onChange={(e) => setPersonName(e.target.value)} 
                      className="input-3d" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleVideoUpload} 
                  disabled={!videoFile}
                  className="btn-3d-primary w-full disabled:opacity-50 disabled:pointer-events-none"
                >
                  <CheckCircle className="w-4 h-4" /> Process Check-in Video
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center dark:text-slate-600 text-slate-400 text-xs border-t dark:border-white/5 border-slate-200 mt-auto">
        <p>&copy; 2026 BiometricAI Inc. All rights reserved. Secure Face Identification Dashboard.</p>
      </footer>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b dark:border-white/5 border-slate-200 pb-4">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <div className="icon-3d-indigo w-8 h-8 rounded-xl"><Mail className="w-4 h-4 animate-bounce" /></div> Send Attendance Report
                </h3>
                <button onClick={() => setIsReportModalOpen(false)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Recipient Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="e.g. admin@organization.com"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    className="input-3d"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="csvCheckbox" 
                    checked={includeCSV}
                    onChange={(e) => setIncludeCSV(e.target.checked)}
                    className="w-4 h-4 rounded dark:border-white/10 border-slate-300 dark:bg-slate-900 bg-white focus:ring-0 accent-primary-500"
                  />
                  <label htmlFor="csvCheckbox" className="text-xs dark:text-slate-300 text-slate-600">Include full check-ins CSV file as attachment</label>
                </div>

                <button type="submit" className="btn-3d-primary w-full mt-2">
                  <Mail className="w-4 h-4" /> Send Email Report
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b dark:border-white/5 border-slate-200 pb-4">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <div className="icon-3d-primary w-8 h-8 rounded-xl"><User className="w-4 h-4" /></div> Administrator Profile
                </h3>
                <button onClick={() => setIsProfileOpen(false)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary-500/20">
                  AD
                </div>
                <div>
                  <h4 className="font-bold">System Administrator</h4>
                  <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">admin@biometricai.com</p>
                </div>
              </div>

              <div className="border-t dark:border-white/5 border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between text-xs py-1">
                  <span className="dark:text-slate-400 text-slate-500 font-bold uppercase tracking-wider">Role Privilege</span>
                  <span className="text-primary-600 dark:text-primary-400 font-extrabold uppercase tracking-wider">Root Access</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="dark:text-slate-400 text-slate-500 font-bold uppercase tracking-wider">Platform License</span>
                  <span className="text-emerald-500 font-extrabold">Startup Pro</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="dark:text-slate-400 text-slate-500 font-bold uppercase tracking-wider">Server Location</span>
                  <span className="dark:text-slate-300 text-slate-700 font-mono font-bold">http://localhost:5001</span>
                </div>
              </div>

              <button onClick={() => setIsProfileOpen(false)} className="btn-3d-secondary w-full">
                Close Profile
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
