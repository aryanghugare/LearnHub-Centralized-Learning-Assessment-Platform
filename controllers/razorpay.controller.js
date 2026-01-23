import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { ApiError } from "../middleware/error.middleware.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
// here we could have used asyncHandler too 
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.id ;
    const { courseId } = req.body;

const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError('Course not found', 404);
    }

const newPurchase = new CoursePurchase({
course: courseId,
user: userId,
amount: course.price ,
status : 'pending',
});

const options = {
      amount: course.price * 100, // amount in the smallest currency unit(paise)
      currency: "INR",
      receipt: `course_${courseId}`,
      notes : {
      userId : userId,
      courseId : courseId,
      purchaseId : newPurchase._id.toString()
      }
    };

 const order = await razorpay.orders.create(options);

// should be validating about the things like amount deducted and actual amount 

newPurchase.paymentId = order.id;
await newPurchase.save();

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      course: courseId,
      purchaseId : newPurchase._id
    });

  } catch (error) {
    throw new ApiError('Failed to create Razorpay order', 500);
  }
};


export const verifyPayment = async (req, res) => {
  
};




