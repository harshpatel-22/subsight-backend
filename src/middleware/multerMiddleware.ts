import multer from 'multer'

// Multer storage setup for avatar upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/') // Folder
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '-' + file.originalname) // File name format
	},
})

// File type filter for image files (jpg, jpeg, png)
const fileFilter = (req: any, file: any, cb: any) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true) //accept 
	} else {
		cb(new Error('Only .jpg and .png files are allowed'), false) //reject
	}
}

// Max size 5MB
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
	fileFilter,
})

export default upload
