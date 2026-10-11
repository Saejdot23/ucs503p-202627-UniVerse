import { Router } from "express";
import {
    requestSession,
    getMySessions,
    getSession,
    respondToSession,
    cancelSession,
    markSessionComplete,
    confirmCompletion,
    reportNoShow,
    rateSession,
    createListing,
    getListings,
    updateListing,
    deleteListing,
} from "../controllers/session.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

// Session CRUD
router.route("/").get(getMySessions).post(requestSession);

// Session listings (before /:id to avoid route conflict)
router.route("/listings").get(getListings).post(createListing);
router.route("/listings/:listingId").patch(updateListing).delete(deleteListing);

// Individual session actions
router.route("/:id").get(getSession);
router.route("/:id/respond").patch(respondToSession);
router.route("/:id/cancel").patch(cancelSession);
router.route("/:id/complete").patch(markSessionComplete);
router.route("/:id/confirm-complete").patch(confirmCompletion);
router.route("/:id/no-show").post(reportNoShow);
router.route("/:id/rate").post(rateSession);

export default router;
