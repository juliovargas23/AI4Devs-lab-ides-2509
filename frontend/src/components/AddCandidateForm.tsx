import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from './FormField';
import FileUpload from './FileUpload';
import { candidateApi } from '../services/candidateApi';
import { formValidator } from '../utils/formValidator';
import { CandidateFormData, Education, WorkExperience, ValidationError } from '../types/candidate';
import '../styles/AddCandidateForm.css';

const AddCandidateForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CandidateFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    educations: [],
    workExperiences: [],
    resume: undefined,
  });

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, resume: file || undefined }));
    if (validationErrors.resume) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.resume;
        return newErrors;
      });
    }
  };

  const handleAddEducation = () => {
    const newEducation: Education = {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setFormData((prev) => ({
      ...prev,
      educations: [...(prev.educations || []), newEducation],
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations?.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ) || [],
    }));
  };

  const handleAddWorkExperience = () => {
    const newExperience: WorkExperience = {
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
    };
    setFormData((prev) => ({
      ...prev,
      workExperiences: [...(prev.workExperiences || []), newExperience],
    }));
  };

  const handleRemoveWorkExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: string) => {
    setFormData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences?.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setSubmitSuccess(false);
    setSubmitError('');
    
    // Validate form
    const errors = formValidator.validate(formData);
    if (errors.length > 0) {
      const errorMap: { [key: string]: string } = {};
      errors.forEach((error: ValidationError) => {
        errorMap[error.field] = error.message;
      });
      setValidationErrors(errorMap);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await candidateApi.addCandidate(formData);
      
      if (response.success) {
        setSubmitSuccess(true);
        // Redirect to candidate list after 1.5 seconds
        setTimeout(() => {
          navigate('/candidates');
        }, 1500);
      } else {
        setSubmitError(response.error?.message || 'Failed to add candidate');
        if (response.error?.field) {
          setValidationErrors({ [response.error.field]: response.error.message });
        }
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-candidate-form">
      <div className="add-candidate-form__header">
        <button
          type="button"
          className="add-candidate-form__back-button"
          onClick={() => navigate('/candidates')}
          aria-label="Back to candidate list"
        >
          ← Back to List
        </button>
        <h1 className="add-candidate-form__title">Add New Candidate</h1>
      </div>
      
      {submitSuccess && (
        <div className="add-candidate-form__success">
          Candidate added successfully! Redirecting to list...
        </div>
      )}
      
      {submitError && (
        <div className="add-candidate-form__error">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-candidate-form__form">
        {/* Basic Information */}
        <section className="add-candidate-form__section">
          <h2 className="add-candidate-form__section-title">Basic Information</h2>
          
          <div className="add-candidate-form__row">
            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={validationErrors.firstName}
              required
              placeholder="Enter first name"
            />
            
            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={validationErrors.lastName}
              required
              placeholder="Enter last name"
            />
          </div>

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={validationErrors.email}
            required
            placeholder="Enter email address"
          />

          <FormField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={handleInputChange}
            error={validationErrors.phone}
            placeholder="Enter phone number"
          />

          <FormField
            label="Address"
            name="address"
            type="textarea"
            value={formData.address || ''}
            onChange={handleInputChange}
            error={validationErrors.address}
            placeholder="Enter address"
            rows={2}
          />
        </section>

        {/* Resume Upload */}
        <section className="add-candidate-form__section">
          <FileUpload
            onFileSelect={handleFileSelect}
            error={validationErrors.resume}
          />
        </section>

        {/* Education */}
        <section className="add-candidate-form__section">
          <div className="add-candidate-form__section-header">
            <h2 className="add-candidate-form__section-title">Education</h2>
            <button
              type="button"
              onClick={handleAddEducation}
              className="add-candidate-form__add-btn"
            >
              + Add Education
            </button>
          </div>

          {formData.educations?.map((education, index) => (
            <div key={index} className="add-candidate-form__subsection">
              <div className="add-candidate-form__subsection-header">
                <h3 className="add-candidate-form__subsection-title">Education {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className="add-candidate-form__remove-btn"
                >
                  Remove
                </button>
              </div>

              <div className="add-candidate-form__row">
                <FormField
                  label="Institution"
                  name={`institution-${index}`}
                  value={education.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  placeholder="Enter institution name"
                  required
                />
                
                <FormField
                  label="Degree"
                  name={`degree-${index}`}
                  value={education.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  placeholder="Enter degree"
                  required
                />
              </div>

              <FormField
                label="Field of Study"
                name={`fieldOfStudy-${index}`}
                value={education.fieldOfStudy || ''}
                onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                placeholder="Enter field of study"
              />

              <div className="add-candidate-form__row">
                <FormField
                  label="Start Date"
                  name={`startDate-${index}`}
                  value={education.startDate}
                  onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                  placeholder="YYYY-MM-DD"
                  required
                />
                
                <FormField
                  label="End Date"
                  name={`endDate-${index}`}
                  value={education.endDate || ''}
                  onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                  placeholder="YYYY-MM-DD or leave empty if ongoing"
                />
              </div>

              <FormField
                label="Description"
                name={`description-${index}`}
                type="textarea"
                value={education.description || ''}
                onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                placeholder="Enter description"
              />
            </div>
          ))}
        </section>

        {/* Work Experience */}
        <section className="add-candidate-form__section">
          <div className="add-candidate-form__section-header">
            <h2 className="add-candidate-form__section-title">Work Experience</h2>
            <button
              type="button"
              onClick={handleAddWorkExperience}
              className="add-candidate-form__add-btn"
            >
              + Add Work Experience
            </button>
          </div>

          {formData.workExperiences?.map((experience, index) => (
            <div key={index} className="add-candidate-form__subsection">
              <div className="add-candidate-form__subsection-header">
                <h3 className="add-candidate-form__subsection-title">Experience {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveWorkExperience(index)}
                  className="add-candidate-form__remove-btn"
                >
                  Remove
                </button>
              </div>

              <div className="add-candidate-form__row">
                <FormField
                  label="Company"
                  name={`company-${index}`}
                  value={experience.company}
                  onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
                
                <FormField
                  label="Position"
                  name={`position-${index}`}
                  value={experience.position}
                  onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                  placeholder="Enter position"
                  required
                />
              </div>

              <div className="add-candidate-form__row">
                <FormField
                  label="Start Date"
                  name={`startDate-${index}`}
                  value={experience.startDate}
                  onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                  placeholder="YYYY-MM-DD"
                  required
                />
                
                <FormField
                  label="End Date"
                  name={`endDate-${index}`}
                  value={experience.endDate || ''}
                  onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                  placeholder="YYYY-MM-DD or leave empty if current"
                />
              </div>

              <FormField
                label="Description"
                name={`description-${index}`}
                type="textarea"
                value={experience.description || ''}
                onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements"
              />
            </div>
          ))}
        </section>

        {/* Submit Button */}
        <div className="add-candidate-form__actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="add-candidate-form__submit-btn"
          >
            {isSubmitting ? 'Submitting...' : 'Add Candidate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCandidateForm;
