import express from "express";
import { submitContact, getContacts, updateContactStatus } from "../controllers/contactController.js";

const contactRoutes = express.Router();

contactRoutes.post("/", submitContact);
contactRoutes.get("/", getContacts);
contactRoutes.put("/:id/status", updateContactStatus);

export default contactRoutes;