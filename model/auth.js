import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    jti: { type: String, required: true },
});

const Token = mongoose.model('Token', tokenSchema, 'token');

export default Token;