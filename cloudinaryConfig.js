import { Cloudinary } from 'cloudinary-core';

const cloudName = process.env.REACT_APP_ZEN_TIME_CLOUDINARY_CLOUD_NAME;
const cl = new Cloudinary({ cloud_name: cloudName , secure: true });
export default cl;
