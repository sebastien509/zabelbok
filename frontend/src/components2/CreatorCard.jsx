import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components2/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components2/ui/avatar';
import { Button } from '@/components2/ui/button';
import { motion } from 'framer-motion';

export default function CreatorCard({ creator, compact = false }) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/creator/${creator.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className={`shadow-md hover:shadow-lg transition duration-200 ${compact ? 'text-sm' : ''}`}>
        <CardHeader className={`flex flex-col items-center text-center space-y-2 ${compact ? 'py-3' : 'py-4'}`}>
          <Avatar className={compact ? 'h-12 w-12' : 'h-16 w-16'}>
            <AvatarImage src={creator.profile_image_url} alt={creator.full_name} />
            <AvatarFallback>{creator.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className={`font-semibold truncate max-w-[200px] ${compact ? 'text-sm' : 'text-base'}`}>
            {creator.full_name}
          </CardTitle>
        </CardHeader>

        <CardContent className={`px-4 ${compact ? 'text-xs' : 'text-sm'} text-gray-600 line-clamp-2`}>
          {creator.bio || 'No bio available'}
        </CardContent>

        <CardFooter className={`${compact ? 'px-3 pb-3 pt-1' : 'px-4 pb-4 pt-2'} flex justify-center`}>
          <Button onClick={handleViewProfile} variant="outline" size="sm">
            View Creator Page
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
