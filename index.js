import dotenv from 'dotenv';
dotenv.config();
import morgan from 'morgan';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// logging middleware
// using morgan only in development mode in this application
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true , limit: '10kb' }));

// Global Error Handler 
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(err.status || 500).json({
status: "error",
message: err.message || "Internal Server Error",
...(process.env.NODE_ENV === 'development' && { stack: err.stack })

})
})

// API Routes


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