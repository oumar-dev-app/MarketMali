import { Response } from "express";


export function successResponse(
  res: Response,
  message: string,
  data?: any,
  status = 200
) {

  return res.status(status).json({
    success: true,
    message,
    data
  });

}



export function errorResponse(
  res: Response,
  message: string,
  status = 400
) {

  return res.status(status).json({
    success: false,
    message
  });

}