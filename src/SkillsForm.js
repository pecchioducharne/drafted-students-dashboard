import React from "react";

const SkillsForm = ({ selectedSkills, setSelectedSkills, skillsOptions }) => {
  // Handle skill selection
  const handleSkillChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    // Limit to maximum 3 selections
    setSelectedSkills(selectedOptions.slice(0, 3));
  };

  // Handle removing a selected skill
  const removeSkill = (skillToRemove) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Handle clicking on a skill to select it
  const toggleSkillSelection = (skill) => {
    if (selectedSkills.includes(skill)) {
      // If skill is already selected, remove it
      removeSkill(skill);
    } else if (selectedSkills.length < 3) {
      // If less than 3 skills selected, add it
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="skills-form">
      <div className="details-item">
        <div className="selected-skills">
          {selectedSkills.map((skill, index) => (
            <div
              key={index}
              className="skill-item"
              onClick={() => toggleSkillSelection(skill)}
            >
              {skill}
              <span className="remove-btn">    <strong>x</strong></span>
            </div>
          ))}
        </div>
      </div>
      <div className="details-item">
        <div className="add-skills">
          <h3>Add Skills</h3>
          <select multiple value={selectedSkills} onChange={handleSkillChange}>
            {skillsOptions.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;
