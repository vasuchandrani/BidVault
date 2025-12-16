import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: "dfupuovfz",
  api_key: "653292686383954",
  api_secret: "Yd_Sajjev0jN2k7uzCxch-Xhu4I",
});

export default cloudinary;