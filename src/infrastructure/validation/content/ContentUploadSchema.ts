import * as yup from "yup";

export const ContentUploadSchema = yup.object().shape({
  title: yup.string().required("Title is required").min(3, "Title must be at least 3 characters"),
  description: yup.string().optional(),
  subject: yup.string().required("Subject is required"),
  start_time: yup.date().nullable().optional(),
  end_time: yup.date().nullable().optional()
    .test("end-after-start", "End time must be after start time", function (value) {
      const { start_time } = this.parent;
      if (!start_time || !value) return true;
      return new Date(value) > new Date(start_time);
    }),
  rotation_duration: yup.number().nullable().optional().min(1, "Rotation duration must be at least 1 minute"),
});
