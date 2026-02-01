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
      return res.status(404).json({message : 'Course not found'});
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
  try {
const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
const body = razorpay_order_id + "|" + razorpay_payment_id;

// This expectedSignature calculation is from the Razorpay docs
const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                 .update(body.toString())
                                 .digest('hex');

const isAuthentic = expectedSignature === razorpay_signature;

if(!isAuthentic){
  return res.status(400).json({message : 'Payment verification failed'});

}
const purchase = await CoursePurchase.findOne({ paymentId: razorpay_order_id });

if(!purchase){
  return res.status(404).json({message : 'Purchase record not found'});
}

purchase.status = 'completed';

await purchase.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      purchaseId : purchase.course 
    });


    
  } catch (error) {
    throw new ApiError('Payment verification failed', 500);
  }
};




