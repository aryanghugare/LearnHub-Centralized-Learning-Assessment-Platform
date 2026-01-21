import dotenv from 'dotenv';
dotenv.config();
import morgan from 'morgan';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
// import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";
import hpp from "hpp";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import healthRoute from './routes/health.route.js';

const app = express();
const PORT = process.env.PORT || 3000;


// Rate Limiting Middleware(For security purposes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

// security middleware
app.use(helmet());
// app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
// app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use('/api',limiter);

// logging middleware
// using morgan only in development mode in this application
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true , limit: '10kb' }));
app.use(cookieParser());

// Global Error Handler 
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(err.status || 500).json({
status: "error",
message: err.message || "Internal Server Error",
...(process.env.NODE_ENV === 'development' && { stack: err.stack })

})
})

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  })
);



// API Routes
app.use('/health', healthRoute);

// it should be always at bottom 
// 404 handler
app.use((req,res)=>{
res.status(404).json({
status: "error",
message: "Route not found"
})
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});