const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        trim: true,
        maxlength: [30, 'Role name cannot exceed 30 characters']
    },
    permissions: {
        type: [String],
        default: []
    },
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;