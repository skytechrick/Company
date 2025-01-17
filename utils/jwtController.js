import jwt from 'jsonwebtoken';

const jwtOption = {
    expiresIn: '30d',
    issuer: "getskybuy.in",
    audience: "customers",
    algorithm: "HS256",
};

export const generateToken = ( payload ) => {
    return jwt.sign( payload , process.env.JWT_SECRET , jwtOption );
};

export const verifyToken = ( token ) => {
    try {
        return jwt.verify( token , process.env.JWT_SECRET , jwtOption );
    } catch (error) {
        return null;
    };
};
