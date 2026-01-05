const mongoose = require('mongoose');

const userRolesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, 'Role ID is required']
    }
}, {
    timestamps: true
});

const User_Roles = mongoose.model('User_Roles', userRolesSchema);

module.exports = User_Roles;