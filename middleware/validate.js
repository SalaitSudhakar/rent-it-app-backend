import { validationResult } from "express-validator";

const validateData = (req, res, next) => {
  const errors = validationResult(req); // passing req to receive data which are validated based on our authValidator.js
  
  if (!errors.isEmpty()){
    return res.status(422).json({errors: errors.array()})
  }

  next()
};

export default validateData;
