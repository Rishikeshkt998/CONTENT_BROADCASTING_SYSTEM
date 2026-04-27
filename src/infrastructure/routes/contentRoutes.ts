import { Router } from "express";
import { container } from "../ioc/registry";
import { authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";
import ContentController from "../../controllers/ContentController";
import { authenticate } from "../middleware/auth";

const router = Router();
const contentController = container.resolve("ContentController") as ContentController;

router.post(
  "/",
  authenticate,
  authorize(["teacher"]),
  upload.single("file"),
  (req, res, next) => contentController.uploadContent(req, res)
);

router.get("/", authenticate, (req, res, next) =>
  contentController.getContentList(req, res)
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize(["principal"]),
  (req, res, next) => contentController.approveContent(req, res)
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize(["principal"]),
  (req, res, next) => contentController.rejectContent(req, res)
);

router.get("/live/:teacherId", (req, res, next) =>
  contentController.getLiveContent(req, res)
);

export default router;
