// placeholderCreatorData.js
export const placeholderCreatorData = {
    creator: {
      id: 1,
      full_name: "Dr. Sarah Chen",
      email: "sarah.chen@university.edu",
      role: "professor",
      school_id: 1,
      bio: "Award-winning Computer Science professor with 10+ years of experience in AI and Machine Learning. Passionate about making complex concepts accessible to students of all levels. Former research scientist at Google AI.",
      profile_image_url: "https://www.headshotphoto.io/_vercel/image?url=%2Fimages%2Fblogs%2Fearth-tones.webp&w=1536&q=100",
      banner_url: "https://res.cloudinary.com/dyeomcmin/image/upload/v1740688150/bgs_w6ilsk.png",
      theme: "theme-1",
      color: false,
      slug: "sarah-chen",
      language: "en",
      created_at: "2024-01-15T10:00:00Z",
      template_type: "bento" // Can be 'bento', 'glassmorphism', or 'minimalistic'
    },
    courses: [
      {
        id: 1,
        title: "Introduction to Artificial Intelligence",
        description: "Learn the fundamentals of AI, including machine learning, neural networks, and natural language processing. Perfect for beginners looking to understand the basics of modern AI systems.",
        professor_id: 1,
        school_id: 1,
        student_count: 245,
        module_count: 8,
        duration: "12 weeks",
        level: "Beginner",
        rating: 4.8,
        price: 89.99,
        image_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        created_at: "2024-02-01T09:00:00Z",
        modules: [
          { id: 1, title: "What is AI?", duration: "2 hours" },
          { id: 2, title: "Machine Learning Basics", duration: "3 hours" },
          { id: 3, title: "Neural Networks", duration: "4 hours" }
        ]
      },
      {
        id: 2,
        title: "Advanced Machine Learning",
        description: "Deep dive into advanced ML techniques including deep learning, reinforcement learning, and computer vision. Build real-world projects and deploy models.",
        professor_id: 1,
        school_id: 1,
        student_count: 156,
        module_count: 10,
        duration: "16 weeks",
        level: "Advanced",
        rating: 4.9,
        price: 129.99,
        image_url: "https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        created_at: "2024-02-15T14:30:00Z",
        modules: [
          { id: 1, title: "Deep Learning Fundamentals", duration: "3 hours" },
          { id: 2, title: "Convolutional Neural Networks", duration: "4 hours" },
          { id: 3, title: "Natural Language Processing", duration: "5 hours" }
        ]
      },
      {
        id: 3,
        title: "Python for Data Science",
        description: "Master Python programming for data analysis, visualization, and scientific computing. Learn pandas, numpy, matplotlib and scikit-learn.",
        professor_id: 1,
        school_id: 1,
        student_count: 312,
        module_count: 6,
        duration: "8 weeks",
        level: "Intermediate",
        rating: 4.7,
        price: 69.99,
        image_url: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        created_at: "2024-01-20T11:15:00Z",
        modules: [
          { id: 1, title: "Python Basics", duration: "2 hours" },
          { id: 2, title: "Data Analysis with Pandas", duration: "3 hours" },
          { id: 3, title: "Data Visualization", duration: "3 hours" }
        ]
      },
      {
        id: 4,
        title: "Ethics in AI",
        description: "Explore the ethical implications of artificial intelligence, including bias, privacy, and societal impact. Essential for responsible AI development.",
        professor_id: 1,
        school_id: 1,
        student_count: 89,
        module_count: 5,
        duration: "6 weeks",
        level: "All Levels",
        rating: 4.9,
        price: 49.99,
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        created_at: "2024-03-01T16:45:00Z",
        modules: [
          { id: 1, title: "AI and Society", duration: "2 hours" },
          { id: 2, title: "Bias in Algorithms", duration: "3 hours" },
          { id: 3, title: "Future of AI", duration: "2 hours" }
        ]
      }
    ],
    highlights: [
      {
        title: "Industry Expert",
        desc: "10+ years experience in AI research and development"
      },
      {
        title: "Student Success",
        desc: "Over 800 students taught with 95% satisfaction rate"
      },
      {
        title: "Research Background",
        desc: "Published 20+ papers in top AI conferences"
      },
      {
        title: "Practical Focus",
        desc: "Courses emphasize real-world applications and projects"
      }
    ],
    links: [
      {
        label: "Personal Website",
        url: "https://sarahchen-ai.com"
      },
      {
        label: "LinkedIn Profile",
        url: "https://linkedin.com/in/sarahchen"
      },
      {
        label: "Research Papers",
        url: "https://scholar.google.com/citations?user=sarahchen"
      },
      {
        label: "GitHub Portfolio",
        url: "https://github.com/sarahchen"
      }
    ],
    stats: {
      total_courses: 4,
      total_students: 802,
      average_rating: 4.8,
      completion_rate: 87,
      years_experience: 10,
      student_satisfaction: 95
    },
    testimonials: [
      {
        id: 1,
        student_name: "Alex Johnson",
        student_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        text: "Dr. Chen's AI course completely changed my career path. The way she explains complex concepts is incredible!",
        rating: 5,
        course: "Introduction to Artificial Intelligence"
      },
      {
        id: 2,
        student_name: "Maria Garcia",
        student_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        text: "The practical projects in the Machine Learning course gave me the confidence to apply for data science roles.",
        rating: 5,
        course: "Advanced Machine Learning"
      }
    ]
  };
  
  // Alternative minimal data for testing
  export const minimalCreatorData = {
    creator: {
      id: 2,
      full_name: "Prof. James Wilson",
      bio: "Mathematics professor specializing in calculus and linear algebra.",
      profile_image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      banner_url: null,
      theme: "theme-2",
      color: true,
      slug: "james-wilson"
    },
    courses: [],
    highlights: [],
    links: [],
    stats: {
      total_courses: 0,
      total_students: 0,
      average_rating: 0,
      completion_rate: 0
    }
  };
  
  // Utility function to generate random creator data
  export const generateRandomCreatorData = (templateType = 'bento') => {
    const firstNames = ['Alex', 'Maria', 'James', 'Sarah', 'David', 'Lisa', 'Michael', 'Emma'];
    const lastNames = ['Johnson', 'Smith', 'Brown', 'Davis', 'Wilson', 'Taylor', 'Clark', 'Rodriguez'];
    const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'History', 'Literature'];
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    
    return {
      creator: {
        id: Math.floor(Math.random() * 1000) + 1,
        full_name: `${randomFirstName} ${randomLastName}`,
        bio: `Professor of ${randomSubject} with a passion for teaching and research.`,
        profile_image_url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 10000000)}?auto=format&fit=crop&w=500&q=80`,
        banner_url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 10000000)}?auto=format&fit=crop&w=1200&q=80`,
        theme: Math.random() > 0.5 ? 'theme-1' : 'theme-2',
        color: Math.random() > 0.5,
        slug: `${randomFirstName.toLowerCase()}-${randomLastName.toLowerCase()}`,
        template_type: templateType
      },
      courses: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
        id: i + 1,
        title: `${['Introduction to', 'Advanced', 'Fundamentals of', 'Mastering'][i % 4]} ${randomSubject}`,
        description: `Learn ${randomSubject.toLowerCase()} through practical examples and real-world applications.`,
        student_count: Math.floor(Math.random() * 200) + 50,
        rating: 4.5 + (Math.random() * 0.5),
        price: [49.99, 69.99, 89.99, 129.99][i % 4]
      }))
    };
  };