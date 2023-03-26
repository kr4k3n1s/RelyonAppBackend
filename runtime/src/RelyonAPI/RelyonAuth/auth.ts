const jwt = require("jsonwebtoken");

export const UserAuth = async (request: any, response: any, next: any) => {
  try {
    if(request.headers.authorization === undefined) throw new Error('Authorization is required.');
    const token = await request.headers.authorization.split(" ")[1];
    const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");
    const user = await decodedToken;
    request.user = user;
    next();
  } catch (error: any) {
    response.status(401).json({
      status: "error",
      auth: 'invalid',
      message: 'Your request is invalid.',
      error: error.message,
    });
  }
};

export const AdminAuth = async (request: any, response: any, next: any) => {
  try {
    if(request.headers.authorization === undefined) throw new Error('Authorization is required.');
    const token = await request.headers.authorization.split(" ")[1];
    const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");
    console.log('USER: ' + JSON.stringify(decodedToken));
    if(!decodedToken.isAdmin) throw new Error('Admin user is required for this operation.');
    request.user = decodedToken;
    next();
  } catch (error: any) {
    response.status(401).json({
      status: "error",
      auth: 'invalid',
      message: 'Your request is invalid.',
      error: error.message,
    });
  }
};

