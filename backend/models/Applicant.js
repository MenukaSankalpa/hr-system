// import mongoose from "mongoose";

// const applicantSchema = new mongoose.Schema({
//   name: String,
//   hometown: String,
//   age: Number,
//   employeeStatus: String,
//   familyDetails: String,
//   reasonForLeaving: String,
//   experience: String,
//   phone: String,
//   nicNumber: String,
  
//   // Scoring Fields
//   punctuality: Number,
//   preparedness: Number,
//   communicationSkills: Number,
//   experienceRequired: Number,
//   qualificationRequired: Number,
  
//   // ⭐ THE CRITICAL FIX: Add totalMarks here ⭐
//   totalMarks: Number, 
  
//   comments: String,
//   noticePeriod: String,
//   presentSalary: Number,
//   expectedSalary: Number,
//   possibleStartDate: String,
//   overallResult: String,

//   // ⭐ ADDED STATUS FIELD & VALIDATION ⭐
//   status: {
//     type: String,
//     enum: ['selected', 'not-selected', 'future-select', 'pending'], 
//     default: 'pending', 
//   },

//   interviewer1Name: String,
//   interviewer1Designation: String,
//   interviewer1Sign: String,
//   interviewer1Date: String,

//   interviewer2Name: String,
//   interviewer2Designation: String,
//   interviewer2Sign: String,
//   interviewer2Date: String,

//   interviewer3Name: String,
//   interviewer3Designation: String,
//   interviewer3Sign: String,
//   interviewer3Date: String,

//   appointmentDate: String,
//   position: String,
//   companyName: String,
//   department: String,
//   agreedSalary: Number,
//   benefits: String,

//   cvFile: String,
// }, { timestamps: true }); 

// export default mongoose.model("Applicant", applicantSchema);

import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema({
  name: String,
  hometown: String,
  age: Number,
  employeeStatus: String,
  familyDetails: String,
  reasonForLeaving: String,
  experience: String,
  phone: String,
  nicNumber: String,

  // Scoring Fields
  punctuality: Number,
  preparedness: Number,
  communicationSkills: Number,
  experienceRequired: Number,
  qualificationRequired: Number,
  totalMarks: Number, // Important

  comments: String,
  noticePeriod: String,
  presentSalary: Number,
  expectedSalary: Number,
  possibleStartDate: String,
  overallResult: String,

  status: {
    type: String,
    enum: ["selected", "not-selected", "future-select", "pending"],
    default: "pending",
  },

  interviewer1Name: String,
  interviewer1Designation: String,
  interviewer1Sign: String,
  interviewer1Date: String,

  interviewer2Name: String,
  interviewer2Designation: String,
  interviewer2Sign: String,
  interviewer2Date: String,

  interviewer3Name: String,
  interviewer3Designation: String,
  interviewer3Sign: String,
  interviewer3Date: String,

  appointmentDate: String,
  position: String,
  companyName: String,
  department: String,
  agreedSalary: Number,
  benefits: String,

  cvFile: String,
}, { timestamps: true });

export default mongoose.model("Applicant", applicantSchema);
