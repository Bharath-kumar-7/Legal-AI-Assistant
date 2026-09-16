import { Router, type IRouter } from "express";
import healthRouter from "./health";
import legalRouter from "./legal";
import authRouter from "./auth";
import lawyerRouter from "./lawyer";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(legalRouter);
router.use(lawyerRouter);
router.use(adminRouter);

export default router;
