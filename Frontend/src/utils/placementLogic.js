// Placement prediction logic
export const calculatePlacementProbability = (skills, experience, education) => {
  let score = 0;
  
  // Skills scoring (max 40 points)
  if (skills && skills.length > 0) {
    const techSkills = skills.filter(skill => 
      ['JavaScript', 'React', 'Python', 'Java', 'Node.js', 'SQL'].includes(skill)
    ).length;
    score += Math.min(techSkills * 8, 40);
  }
  
  // Experience scoring (max 30 points)
  if (experience) {
    const years = parseInt(experience) || 0;
    score += Math.min(years * 6, 30);
  }
  
  // Education scoring (max 30 points)
  if (education) {
    const educationLevels = {
      'High School': 10,
      'Bachelor': 20,
      'Master': 25,
      'PhD': 30
    };
    score += educationLevels[education] || 10;
  }
  
  return Math.min(score, 100);
};

export const getCareerRecommendations = (skills, experience) => {
  const skillMap = {
    'JavaScript': ['Frontend Developer', 'Full Stack Developer', 'UI/UX Designer'],
    'React': ['Frontend Developer', 'Full Stack Developer', 'React Developer'],
    'Python': ['Data Scientist', 'Backend Developer', 'Machine Learning Engineer'],
    'Java': ['Backend Developer', 'Full Stack Developer', 'Android Developer'],
    'Node.js': ['Backend Developer', 'Full Stack Developer', 'DevOps Engineer'],
    'SQL': ['Data Analyst', 'Backend Developer', 'Database Administrator']
  };
  
  let recommendations = [];
  
  if (skills && skills.length > 0) {
    skills.forEach(skill => {
      if (skillMap[skill]) {
        recommendations = [...recommendations, ...skillMap[skill]];
      }
    });
  }
  
  // Remove duplicates and return top recommendations
  return [...new Set(recommendations)].slice(0, 5);
};

export const getSkillGaps = (userSkills, requiredSkills) => {
  if (!userSkills || !requiredSkills) return [];
  
  return requiredSkills.filter(skill => !userSkills.includes(skill));
};