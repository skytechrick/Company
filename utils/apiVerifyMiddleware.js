

export const verifyApiUser = (req, res, next) => {
    try {
        
        const token = req.headers.Authorization;
        if (!token) {
            return res.status(401).send({
                isVerified: false,
                message: "Unauthorized access. Please provide a valid token.",
            });
        };


    } catch (error) {
        next(error);
    };
};