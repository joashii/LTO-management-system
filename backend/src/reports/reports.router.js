import { Router } from "express";

import {
  report1,
  report2,
  report3,
  report4,
  report5,
  report6,
  report7,
  generalQuery,
} from "./reports.controller.js";

const router = Router();

// Report 1
// Uses req.query
// Example:
// /report1?license_type=Non-Professional&license_status=Active&sex=Male&min_age=18&max_age=60
router.get("/report1", report1);

// Report 2
// Uses req.params
// Example:
// /report2/N01-23-456789
router.get("/report2/:license_number", report2);

// Report 3
// Uses req.params
// Example:
// /report3/2025-01-01
router.get("/report3/:expiration_date", report3);

// Report 4
// Uses req.params
// Example:
// /report4/Suspended
router.get("/report4/:license_status", report4);

// Report 5
// Uses req.params
// Example:
// /report5/N01-23-456789/2024-01-01/2024-12-31
router.get("/report5/:license_number/:start_date/:end_date", report5);

// Report 6
// Uses req.params
// Example:
// /report6/2024
router.get("/report6/:year", report6);

// Report 7
// Uses req.params
// Example:
// /report7/Pasig
router.get("/report7/:location", report7);

// General Query
router.post("/generalQuery", generalQuery);

export default router;
