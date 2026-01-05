const mongoose = require('mongoose');

const rolePermissions = new mongoose.Schema({
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, 'Role ID is required']
    },
    permission: {
        type: String,
        required: [true, 'Permission is required'],
        trim: true
    }
}, {
    timestamps: true
});

const Role_Permissions = mongoose.model('Role_Permissions', rolePermissions);

module.exports = Role_Permissions;