import React, { useEffect, useState } from 'react';
import { getAllCourses } from '@/services/courses';
import { getMe, getUserCourses, getAllCreators } from '@/services/auth';
import CourseCard from '@/components2/CourseCard';
import CreatorCard from '../CreatorCard';
import { Button } from '@/components2/ui/button';
import { Loader2, BookOpen, Users, Star, Rocket, LogOut } from 'lucide-react';
import { getMyEnrollments } from '@/services/enrollments';
import { getCoursesBySchool } from '@/services/courses';
import { CourseDB, save as saveCourse } from '@/utils/cDB';

export default function LearnerDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [creators, setCreators] = useState([]);
  const [viewByCreator, setViewByCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    favoriteTopics: 3,
    learningStreak: 7
  });

  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [enrollmentsData, setEnrollmentsData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        console.log('📡 Fetching dashboard data...');
  
        const [me, enrolledCoursesRes, allCoursesRes, myEnrollmentsRes, creatorsRes, schoolCourses] = await Promise.all([
          getMe().catch(() => JSON.parse(localStorage.getItem('user') || '{}')),
          getUserCourses().catch(() => []),
          getAllCourses().catch(() => CourseDB.getAll()),
          getMyEnrollments().catch(() => []),
          viewByCreator ? getAllCreators().catch(() => []) : Promise.resolve(null),
          getCoursesBySchool(1).catch(() => CourseDB.getAll()) // fallback to offline
        ]);
  
        const enrolledIds = myEnrollmentsRes?.map(e => e.course_id) || [];
  
        setMyCourses(enrolledCoursesRes || []);
        setEnrolledCourseIds(enrolledIds);
        setEnrollmentsData(myEnrollmentsRes || []);
        setAllCourses(schoolCourses);
  
        if (creatorsRes) {
          const creatorList = Array.isArray(creatorsRes)
            ? creatorsRes
            : creatorsRes?.creators || [];
          setCreators(creatorList);
        }
  
        // Cache courses for offline use
        (schoolCourses || []).forEach(course => {
          if (course?.id) saveCourse(course);
        });
  
        setStats(prev => ({
          ...prev,
          enrolledCourses: enrolledIds.length,
          completedCourses: myEnrollmentsRes?.filter(e => e.completed).length || 0
        }));
      } catch (err) {
        console.error('❌ Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, [viewByCreator]);


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getEnrollmentData = (courseId) => {
    const data = enrollmentsData.find(e => e.course_id === courseId);
    console.log(`🔍 Enrollment for course ${courseId}:`, data);
    return data;
  };

  const unenrolledCourses = allCourses.filter(course => !enrolledCourseIds.includes(course.id));
  const enrolledCourses = allCourses.filter(course => enrolledCourseIds.includes(course.id));

  const uniqueCourses = Array.from(new Map(enrolledCourses.map(c => [c.id, c])).values());

  console.log('🧮 Enrolled Courses:', enrolledCourses);
  console.log('📤 Unenrolled Courses:', unenrolledCourses);

  return (


    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {enrolledCourses.length > 0 ? `+${Math.floor(enrolledCourses.length / 3)} this month` : 'Start learning'}
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mt-2">Enrolled Courses</h3>
          <p className="text-2xl font-bold mt-1">{enrolledCourses.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-100">
          <div className="flex items-center justify-between">
            <Star className="h-6 w-6 text-green-600" />
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {stats.completedCourses > 0 ? `${stats.completedCourses} completed` : 'Keep going'}
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mt-2">Completed</h3>
          <p className="text-2xl font-bold mt-1">{stats.completedCourses}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <Users className="h-6 w-6 text-purple-600" />
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Following
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mt-2">Favorite Topics</h3>
          <p className="text-2xl font-bold mt-1">{stats.favoriteTopics}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between">
            <Rocket className="h-6 w-6 text-orange-600" />
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              Active streak
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mt-2">Day Streak</h3>
          <p className="text-2xl font-bold mt-1">{stats.learningStreak}</p>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm w-full max-w-[1800px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg text-white">
                <BookOpen className="h-5 w-5" />
              </span>
              <span>My Courses</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Continue your learning journey</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setViewByCreator(!viewByCreator)}
            className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow border-gray-300"
          >
            {viewByCreator ? (
              <>
                <BookOpen className="h-4 w-4" />
                Browse All Courses
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Browse by Creators
              </>
            )}
          </Button>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border border-dashed border-gray-300">
            <BookOpen className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No courses yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              You haven't enrolled in any courses yet
            </p>
            <Button 
              onClick={() => setViewByCreator(false)}
              className="gap-2 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <BookOpen className="h-4 w-4" />
              Explore courses
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <div className="flex flex-nowrap space-x-4 pb-2">
              {uniqueCourses.map((course) => (
                <div key={course.id} className="w-[85vw] sm:w-[300px] max-w-[90vw] shrink-0">
                  <CourseCard 
                    course={course} 
                    enrolled={true}
                    enrollmentData={getEnrollmentData(course.id)}
                  />
                </div>
              ))}
            </div>
          </div>

        )}
      </div>

      {/* Explore Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">
          {viewByCreator ? '👤 Top Creators to Follow' : '🎓 Recommended For You'}
        </h2>

        {viewByCreator ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {creators.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No creators found at this time.</p>
              </div>
            ) : (
              creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unenrolledCourses.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <BookOpen className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">You've enrolled in all available courses!</p>
                <p className="text-xs text-gray-400 mt-1">Check back later for new courses</p>
              </div>
            ) : (
              unenrolledCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  enrolled={false}
                />
              ))
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-50 group">
        <div
          onClick={() => {
            if (window.innerWidth < 768) {
              localStorage.clear();
              window.location.href = '/login';
            }
          }}
          className="bg-red-500 p-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
        >
          <LogOut className="h-5 w-5 text-white" />
        </div>

        <div className="hidden group-hover:flex absolute bottom-0 right-0 mb-12 bg-white text-red-500 border border-red-500 font-semibold px-5 py-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all duration-200 items-center gap-2">
          <LogOut size={16} />
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>

        <div className="md:hidden mt-2 text-xs text-red-600 text-center">
          Tap to logout
        </div>
      </div>
    </div>
  );
}