import * as yup from "yup";

export const ContentApprovalSchema = yup.object().shape({
  id: yup.string().required("Content ID is required").uuid("Invalid Content ID format"),
});

export const ContentRejectionSchema = yup.object().shape({
  id: yup.string().required("Content ID is required").uuid("Invalid Content ID format"),
  reason: yup.string().required("Rejection reason is required").min(5, "Reason must be at least 5 characters"),
});
