// FUNCTION 1 — calculatePlacementProbability(predictorInputs)
function calculatePlacementProbability(predictorInputs) {
  let probability = 0;
  
  // Add points based on criteria
  if (predictorInputs.cgpa >= 7) probability += 25;
  if (predictorInputs.projects >= 2) probability += 25;
  if (predictorInputs.internships >= 1) probability += 20;
  if (predictorInputs.certifications >= 2) probability += 15;
  if (predictorInputs.communication === "good") probability += 15;
  
  // Cap at 100
  return Math.min(probability || 0, 100);
}

// FUNCTION 2 — calculateBestRole(totalSkills)
function calculateBestRole(totalSkills) {
  if (totalSkills >= 10) return "Full Stack Developer";
  else if (totalSkills >= 8) return "Frontend Developer";
  else if (totalSkills >= 6) return "Backend Developer";
  else if (totalSkills >= 4) return "Junior Developer";
  else return "Intern / Trainee";
}

// FUNCTION 3 — calculateProfileStrength(profileData)
function calculateProfileStrength(profileData) {
  try {
    // Defensive programming - handle undefined/null
    if (!profileData || typeof profileData !== 'object') {
      console.log("ERROR: Invalid profileData provided");
      return "Very Bad";
    }

    // Safe field extraction with null checks
    const fields = [
      profileData?.name,
      profileData?.courses?.length || 0,
      profileData?.projects?.length || 0,
      profileData?.certifications?.length || 0,
      profileData?.goals?.length || 0,
      profileData?.achievements?.length || 0
    ];

    console.log("Profile strength fields:", fields);

    // Count only truthy values
    let filledCount = 0;
    fields.forEach(field => {
      if (field) {
        filledCount++;
      }
    });

    console.log("Filled count:", filledCount, "out of", fields.length);

    // Prevent division by zero
    if (fields.length === 0) {
      console.log("ERROR: No fields to calculate");
      return "Very Bad";
    }

    // Calculate percentage
    const percentage = (filledCount / fields.length) * 100;
    console.log("Profile completion percentage:", percentage);

    // Map to labels consistent with Dashboard.jsx
    if (percentage >= 80) return "Very Good";
    else if (percentage >= 60) return "Good";
    else if (percentage >= 40) return "Moderate";
    else if (percentage >= 20) return "Needs Work";
    else return "Very Bad";

  } catch (error) {
    console.error("CRITICAL ERROR in calculateProfileStrength:", error);
    return "Very Bad"; // Safe fallback
  }
}

module.exports = {
  calculatePlacementProbability,
  calculateBestRole,
  calculateProfileStrength
};
