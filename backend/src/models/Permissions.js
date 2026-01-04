const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Permission name is required'],
        trim: true,
        maxlength: [255, 'Permission name cannot exceed 255 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    endpoint: {
        type: String,
        required: [true, 'Endpoint is required'],
        trim: true,
        maxlength: [255, 'Endpoint cannot exceed 255 characters']
    },
    method: {
        type: String,
        required: [true, 'HTTP method is required'],
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
    }
}, {
    timestamps: true
});

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;