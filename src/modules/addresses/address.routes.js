import express from "express";
import addressController from "./address.controller.js";

const router = express.Router();

router.post("/", addressController.createAddress);
router.get("/", addressController.getAllAddresses);
router.get("/:id", addressController.getAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

export default router;
