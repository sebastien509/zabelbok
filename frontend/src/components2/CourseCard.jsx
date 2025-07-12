import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components2/ui/card";
import { Button } from "@/components2/ui/button";
import { Badge } from "@/components2/ui/badge";
import { BookOpen, Users, Clock, ArrowRight, Code, Cpu, Database, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bgAnimation from '@/assets/bgAnimation.json';
import Lottie from "lottie-react";
import { renderThumbnail } from "@/utils/renderThumbnail"; // ✅ import reusable thumbnail
import { enrollInCourse } from '@/services/enrollments';
import { toast } from "./ui/use-toast";


export default function CourseCard({ course, enrolled = false, onEnroll, compact = false }) {
  const navigate = useNavigate();
  const firstModule = course.modules?.[0];

  // Fix React error by renaming to PascalCase
  const techIcons = [Code, Cpu, Database, Server];
  const TechIcon = techIcons[Math.floor(Math.random() * techIcons.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
     <Card
  className={`relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 group p-4 ${
    compact ? "text-sm" : "text-base"
  }`}
  onClick={() => navigate(`/learner/courses/${course.id}`)}
>

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
          {firstModule?.video_url ? (
            <div className="relative w-full h-full">
              {renderThumbnail(firstModule)} {/* ✅ Use safe Cloudinary preview */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 text-center px-4">
              <Lottie 
                animationData={bgAnimation} 
                loop={true} 
                className={`${compact ? "w-24 h-24" : "w-32 h-32"} mb-2`} 
              />
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
              {enrolled ? "Enrolled" : "New"}
            </Badge>
            <Badge variant="secondary" className="shadow-md flex items-center gap-1">
              <TechIcon className="h-3 w-3" />
              Tech
            </Badge>
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
          
          <div className="my-3 h-[3px] bg-gradient-to-r from-blue-200 via-purple-200 to-transparent rounded-full" />

          <p className="text-muted-foreground text-sm line-clamp-2">
            {course.description || "No description provided"}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-blue-50/50 p-2 rounded-lg flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium">{course.module_count || 0} Modules</span>
            </div>
            <div className="bg-purple-50/50 p-2 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium">{course.student_count || 0} Learners</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className={`relative z-10 ${compact ? "px-3 pb-3" : "px-4 pb-4"}`}>
        <Button
                    size={compact ? "sm" : "default"}

                    className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"

  onClick={async (e) => {
    e.stopPropagation();
    if (enrolled) {
      navigate(`/learner/courses/${course.id}`);
    } else {
      await enrollInCourse(course.id);
      toast('Enrolled Successfully');
      navigate(`/learner/courses/${course.id}`);
    }
  }}
>
  {enrolled ? 'Continue Learning' : 'Enroll Now'}
</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
