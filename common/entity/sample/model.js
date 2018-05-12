import mongoose from 'mongoose';

export default mongoose.model('sample', {
    _id: {
        type: String
    },
    ip: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
});
