import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components2/ui/card";
import { Button } from "@/components2/ui/button";
import { Badge } from "@/components2/ui/badge";
import { BookOpen, Users, Clock, Edit, BarChart, Settings, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import bgAnimation from '@/assets/bgAnimation.json';
import { renderThumbnail } from "@/utils/renderThumbnail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CreatorCourseCard({ 
  course, 
  setActiveModal,
  compact = false 
}) {
  const techIcons = [BookOpen, BarChart, Settings];
  const TechIcon = techIcons[Math.floor(Math.random() * techIcons.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className={`relative  gap-0 max-h-96 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 group ${
        compact ? "text-sm" : ""
      }`}>
        {/* Bento pattern overlay */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
            {[...Array(9)].map((_, i) => (
              <div 
                key={i} 
                className={`border border-gray-200 ${
                  i % 2 === 0 ? 'bg-blue-100' : 'bg-purple-100'
                }`}
              />
            ))}
          </div>
        </div>

        <CardHeader className={`p-0 ${compact ? "h-32" : "h-48"} overflow-hidden relative`}>
          {course.modules?.[0]?.video_url ? (
            <div className="relative w-full h-full  mb-44 pb-20 ">
              {renderThumbnail(course.modules[0])}
              <div className="absolute inset-0 min-h-32 " />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 text-center px-4">
              <Lottie 
                animationData={bgAnimation} 
                loop={true} 
                className={`${compact ? "w-24 h-24 " : "w-48 h-48"} mb-2`} 
              />
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant="secondary" className="shadow-md flex items-center gap-1">
              <TechIcon className="h-3 w-3" />
              {course.status || 'Draft'}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setActiveModal(`manage-${course.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Course</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveModal(`analytics-${course.id}`)}>
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>View Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveModal(`settings-${course.id}`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Course Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {course.duration && (
            <Badge variant="secondary" className="absolute bottom-3 left-3 flex items-center gap-1 shadow-md">
              <Clock className="h-3 w-3" />
              <span>{course.duration}</span>
            </Badge>
          )}
        </CardHeader>

        <CardContent className={`relative z-10 ${compact ? "p-3" : "p-4"}`}>
          <CardTitle className={`font-bold ${compact ? "text-base" : "text-lg"} line-clamp-2`}>
            {course.title}
          </CardTitle>
          
          <div className="my-1 h-[3px] bg-gradient-to-r from-blue-200 via-purple-200 to-transparent rounded-full" />

        

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-blue-50/50 rounded-lg flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium">{course.module_count || 0} Modules</span>
            </div>
            <div className="bg-purple-50/50  rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium">{course.student_count || 0} Learners</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className={`relative z-10 ${compact ? "px-3 pb-3" : "px-4 pb-4"}`}>
          <Button
            size={compact ? "sm" : "default"}
            variant="outline"
            className="w-full group border-blue-600 text-blue-600 hover:bg-blue-600/10 hover:text-blue-700"
            onClick={() => setActiveModal(`manage-${course.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Manage Course
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}