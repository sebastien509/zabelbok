import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModulesByCourse } from '@/services/modules';
import { getCourseById } from '@/services/courses';
import { ModuleDB } from '@/utils/ModuleDB';
import { ModuleStateManager } from '@/utils/moduleStateManager';
import { Progress } from '@/components2/ui/progress';
import { Button } from '@/components2/ui/button';
import { toast } from '@/components2/ui/use-toast';
import {
  Download, Lock, CheckCircle2, Play, Pause, BookOpen, Clock, Users,
  ArrowRight, Code, Cpu, Database, Server, Award, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import bgAnimation from '@/assets/bgAnimation.json';
import { prefetchModules } from '@/utils/prefetchModules';
import { ArrowLeft } from 'lucide-react'; // Make sure this is imported
import { renderThumbnail } from '@/utils/renderThumbnail';



export default function LearnerCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState([]);
  const [modules, setModules] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [offlineSaved, setOfflineSaved] = useState([]);
  const [loadingModuleId, setLoadingModuleId] = useState(null);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [statusMap, setStatusMap] = useState({});

  const techIcons = [Code, Cpu, Database, Server];

  useEffect(() => {
    const handleOnlineStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          getCourseById(id),
          getModulesByCourse(id)
        ]);
        setCourse(courseRes.data);
        setModules(modulesRes);
        prefetchModules(modulesRes, 2);
        const completedMap = ModuleStateManager.getCompletedMap();
        const courseModuleIds = modulesRes.map(m => m.id);
        const completedInCourse = courseModuleIds.filter(id => completedMap[id]);
        setCompleted(completedInCourse);
        
        const saved = [];
        for (const mod of modulesRes) {
          const exists = await ModuleDB.get(mod.id);
          if (exists) saved.push(mod.id);
        }
        setOfflineSaved(saved);

        const newStatus = {};
        for (let mod of modulesRes) {
          const status = await ModuleStateManager.getModuleStatus(mod.id, modulesRes);
          newStatus[mod.id] = status;
        }
        setStatusMap(newStatus);

      } catch {
        toast( 'Error', {description: 'Failed to load course data', variant: 'destructive' });
      }
    };
    fetchData();
  }, [id]);

  const percentage = modules.length ? Math.floor((completed.length / modules.length) * 100) : 0;
  const filteredModules = modules.filter(mod => !showOfflineOnly || offlineSaved.includes(mod.id));

  const renderThumbnail = (mod) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative">
      <Lottie animationData={bgAnimation} loop className="w-32 h-32" />
      {offlineSaved.includes(mod.id) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-2">
          <p className="text-xs text-white font-medium">Available Offline</p>
        </div>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-10">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`border border-gray-200 ${i % 2 === 0 ? 'bg-blue-100' : 'bg-purple-100'}`} />
          ))}
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{course?.title || 'Loading Course...'}</h1>
          <p className="text-lg text-gray-600 mb-6">{course?.description || 'Course description'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-600" /> Your Progress
          </h2>
          <Button
            variant={showOfflineOnly ? "default" : "outline"}
            onClick={() => setShowOfflineOnly(!showOfflineOnly)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {showOfflineOnly ? 'Show All' : 'Offline Only'}
          </Button>
        </div>
        <Progress
          value={percentage}
          className="h-3 bg-gray-200"
          indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{completed.length} of {modules.length} completed</span>
          <span>{percentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((mod, index) => {
          const status = statusMap[mod.id];
          const isLocked = status === 'locked';
          const TechIcon = techIcons[Math.floor(Math.random() * techIcons.length)];
     
          
          const statusDisplay = {
            completed: { text: 'Completed', icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, color: 'text-green-600', bgColor: 'bg-green-50' },
            resume: { text: 'Resume', icon: <Pause className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
            start: { text: 'Start', icon: <Play className="h-4 w-4 text-blue-500" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            locked: { text: 'Locked', icon: <Lock className="h-4 w-4 text-gray-500" />, color: 'text-gray-500', bgColor: 'bg-gray-50' }
          }[status] || {};

          return (
            <motion.div
              key={mod.id}
              whileHover={{ y: -4 }}
              className={`relative border rounded-xl shadow-sm overflow-hidden bg-white group ${isLocked ? 'opacity-90' : 'hover:shadow-md'}`}
              onClick={() => !isLocked && navigate(`/modules/${mod.id}`)}
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden z-20">
              {renderThumbnail(mod, offlineSaved)}
              </div>
              <div className="p-4 relative z-20">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{mod.title}</h3>
                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                    {statusDisplay.icon}
                    <span>{statusDisplay.text}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{mod.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" /> <span>{mod.duration || 5} min</span>
                  </div>
                </div>
              </div>
              {!isLocked && (
                <div className="px-4 pb-4 space-y-2">
                  {(status === 'start' || status === 'resume') && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/modules/${mod.id}`);
                      }}
                    >
                      {status === 'resume' ? 'Resume Module' : 'Start Module'}
                    </Button>
                  )}
                  {!offlineSaved.includes(mod.id) && isOnline && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingModuleId === mod.id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setLoadingModuleId(mod.id);
                        const { success, error } = await ModuleStateManager.saveModuleOffline(mod);
                        if (success) {
                          toast( 'Saved Offline', {description: `${mod.title} is now available offline.` });
                          setOfflineSaved(prev => [...prev, mod.id]);
                        } else {
                          toast('Error', { description: 'Failed to save module offline', variant: 'destructive' });
                          console.error(error);
                        }
                        setLoadingModuleId(null);
                      }}
                      className="w-full flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" /> Save Offline
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        
      </div>
      
      <div className="hidden md:flex absolute top-6 left-6 z-50 group">
  <div className="group-hover:grid relative w-full bg-white text-blue-500 border border-blue-500 font-semibold px-5 py-2 rounded-full shadow-md hover:bg-blue-500 hover:text-white transition-all duration-200 animate-pulse items-center gap-2">
  <ArrowLeft size={16} className=' animate-pulse' />  

    <button
      onClick={() => {
        window.location.href = '/learner/dashboard';
      }}
    >

    Dashboard
    </button>
  </div>
</div>

{/* Mobile-only Tooltip */}
<button onClick={() => {
        window.location.href = '/learner/dashboard';
      }} className="md:hidden   animate-pulse mt-4 pt-4 text-xs text-blue-600  bg  mx-6 bgtext-center z-50 ">
<ArrowLeft size={16} />    Back to Dashboard
</button>
    </motion.div>
  );
}
