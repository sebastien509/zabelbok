import { motion } from 'framer-motion';
import { carouselImages } from '@/utils/imageTiles';

export default function VerticalCarousel() {
  // Create just one duplicate set for seamless looping
  const duplicatedImages = [...carouselImages, ...carouselImages];
  
  const bentoGroups = [];
  for (let i = 0; i < duplicatedImages.length; i += 4) {
    bentoGroups.push(duplicatedImages.slice(i, i + 4));
  }

  return (
    <div className="relative w-full lg:w-[400px] h-[600px] lg:h-[800px] pr-20 ">
      {/* Inner shadow overlay to prevent cut-off appearance */}
      <div className="absolute inset-0 z-20 pointer-events-none " />
      
      <motion.div
        className="absolute flex flex-col gap-4 lg:gap-6 z-10"
        animate={{ y: ['0%', '-50%'] }} // Only animate halfway since we duplicated
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {bentoGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex gap-4 lg:gap-6">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 lg:gap-6 w-1/2">
              <motion.div
                className="w-full h-[160px] lg:h-[220px] rounded-xl lg:rounded-2xl overflow-hidden shadow-md  transition-all duration-300 hover:scale-[1.03] relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={group[0] || carouselImages[0]}
                  alt={`carousel-${groupIdx}-0`}
                  className="object-cover w-full h-full hover:brightness-110 transition-all duration-300"
                  loading="lazy"
                />
              </motion.div>
              <motion.div
                className="w-full h-[140px] lg:h-[180px] rounded-xl lg:rounded-2xl overflow-hidden shadow-md lg:shadow-lg transition-all duration-300 hover:scale-[1.03]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={group[1] || carouselImages[1]}
                  alt={`carousel-${groupIdx}-1`}
                  className="object-cover w-full h-full hover:brightness-110 transition-all duration-300"
                  loading="lazy"
                />
              </motion.div>
            </div>
            
            {/* Column 2 */}
            <div className="flex flex-col gap-4 lg:gap-6 w-1/2">
              <motion.div
                className="w-full h-[140px] lg:h-[180px] rounded-xl lg:rounded-2xl overflow-hidden shadow-md lg:shadow-lg transition-all duration-300 hover:scale-[1.03]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={group[2] || carouselImages[2]}
                  alt={`carousel-${groupIdx}-2`}
                  className="object-cover w-full h-full hover:brightness-110 transition-all duration-300"
                  loading="lazy"
                />
              </motion.div>
              <motion.div
                className="w-full h-[160px] lg:h-[220px] rounded-xl lg:rounded-2xl overflow-hidden shadow-md lg:shadow-lg transition-all duration-300 hover:scale-[1.03]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={group[3] || carouselImages[3]}
                  alt={`carousel-${groupIdx}-3`}
                  className="object-cover w-full h-full hover:brightness-110 transition-all duration-300"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function VerticalCarouselMobile() {
  const duplicatedImages = [...carouselImages, ...carouselImages];

  return (
    <div className="relative w-full h-[550px] overflow-auto">
      {/* Inner shadow overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_20px_20px_rgba(0,0,0,0.05)]" />

      <div
        className="absolute grid grid-cols-2 gap-4 z-10"
        animate={{ y: ['0%', '-50%'] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {duplicatedImages.map((src, idx) => (
          <motion.div
            key={idx}
            className="h-[160px] rounded-xl overflow-hidden shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={src}
              alt={`carousel-${idx}`}
              className="object-cover w-full h-full hover:brightness-105 transition-all duration-300"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
