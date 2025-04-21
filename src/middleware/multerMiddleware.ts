import multer from 'multer'

// Multer storage setup for avatar upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/') // Folder to store uploaded files
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '-' + file.originalname) // File name format
	},
})

const fileFilter = (req: any, file: any, cb: any) => {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		cb(new Error('Only .jpg, .png, and .webp files are allowed'), false)
	}
}

// Max size 5M
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
	fileFilter,
})

export default upload
